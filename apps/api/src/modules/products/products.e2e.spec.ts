import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('Products E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ limit: 5, page: 1 });
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ limit: 2 });
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should support search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ search: '3M' });
      expect(res.status).toBe(200);
    });

    it('should support brand filtering', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ brandId: '00000000-0000-0000-0000-000000000000' });
      expect([200, 400]).toContain(res.status);
    });

    it('should support sorting by price', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ sortBy: 'price', sortDir: 'asc', limit: 5 });
      expect(res.status).toBe(200);
      if (res.body.data.length >= 2) {
        const prices = res.body.data.map((p: any) => Number(p.price));
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
      }
    });

    it('should return 400 for invalid limit', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ limit: -1 })
        .expect(400);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    let firstProductId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ limit: 1 });
      firstProductId = res.body.data[0]?.id;
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return product detail with relations', async () => {
      if (!firstProductId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${firstProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBeDefined();
      expect(res.body.price).toBeDefined();
      expect(res.body.brand).toBeDefined();
    });
  });
});
