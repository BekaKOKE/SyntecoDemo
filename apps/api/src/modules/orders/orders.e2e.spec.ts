import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('Orders E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
    accessToken = loginRes.body.accessToken;

    const productRes = await request(app.getHttpServer())
      .get('/api/v1/products')
      .query({ limit: 1 });
    productId = productRes.body.data[0]?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Order lifecycle', () => {
    let orderId: string;

    it('should create order from cart', async () => {
      if (!productId) return;

      // Add to cart first
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId, quantity: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ notes: 'E2E test order' });

      expect([200, 201]).toContain(res.status);
      if (res.status === 200 || res.status === 201) {
        orderId = res.body.id;
        expect(res.body.orderNumber).toBeDefined();
        expect(res.body.status).toBeDefined();
      }
    });

    it('should list user orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should get order detail', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(orderId);
      expect(res.body.items).toBeDefined();
    });

    it('should not allow unauthenticated order access', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .expect(401);
    });

    it('should approve order', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/orders/${orderId}/approve`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});
      expect(res.status).toBe(200);
    });

    it('should cancel order', async () => {
      // Create a new order to cancel
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId, quantity: 1 });

      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ notes: 'To cancel' });

      const newOrderId = orderRes.body.id;
      if (!newOrderId) return;

      const res = await request(app.getHttpServer())
        .post(`/api/v1/orders/${newOrderId}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ reason: 'E2E test cancel' });
      expect(res.status).toBe(200);
    });
  });

  describe('Order authorization', () => {
    it('should reject order creation without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ notes: 'test' })
        .expect(401);
    });

    it('should reject order list without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders')
        .expect(401);
    });
  });
});
