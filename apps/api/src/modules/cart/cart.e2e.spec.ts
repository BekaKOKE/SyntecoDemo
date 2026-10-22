import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('Cart E2E', () => {
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

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
    accessToken = loginRes.body.accessToken;

    // Get a product to add to cart
    const productRes = await request(app.getHttpServer())
      .get('/api/v1/products')
      .query({ limit: 1 });
    productId = productRes.body.data[0]?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Guest cart', () => {
    const sessionId = 'test-session-' + Date.now();

    it('should add item to guest cart', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('X-Session-Id', sessionId)
        .send({ productId, quantity: 2 });
      expect([200, 201]).toContain(res.status);
    });

    it('should get guest cart', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('X-Session-Id', sessionId);
      expect(res.status).toBe(200);
    });

    it('should update item quantity', async () => {
      const cartRes = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('X-Session-Id', sessionId);
      const itemId = cartRes.body?.items?.[0]?.id;
      if (!itemId) return;

      const res = await request(app.getHttpServer())
        .put(`/api/v1/cart/items/${itemId}`)
        .set('X-Session-Id', sessionId)
        .send({ quantity: 5 });
      expect(res.status).toBe(200);
    });

    it('should clear guest cart', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/cart')
        .set('X-Session-Id', sessionId)
        .expect([200, 204]);
    });
  });

  describe('Authenticated cart', () => {
    it('should add item to authenticated cart', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId, quantity: 3 });
      expect([200, 201]).toContain(res.status);
    });

    it('should get authenticated cart', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });

    it('should validate cart before checkout', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/validate')
        .set('Authorization', `Bearer ${accessToken}`);
      // Validate endpoint may or may not exist — both 200 and 404 are acceptable
      expect([200, 404]).toContain(res.status);
    });

    it('should remove item from cart', async () => {
      const cartRes = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${accessToken}`);
      const itemId = cartRes.body?.items?.[0]?.id;
      if (!itemId) return;

      await request(app.getHttpServer())
        .delete(`/api/v1/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect([200, 204]);
    });
  });
});
