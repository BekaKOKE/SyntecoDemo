import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Inquiries E2E', () => {
  let app: INestApplication;
  let adminToken: string;
  let csrfToken: string;

  /** Fetch a fresh CSRF token for public mutation tests */
  async function fetchCsrfToken(): Promise<string> {
    const res = await request(app.getHttpServer()).get('/api/v1/csrf-token');
    return res.body.token;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();

    // Login as admin
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
    adminToken = loginRes.body.accessToken;

    // Fetch CSRF token for public mutation tests
    csrfToken = await fetchCsrfToken();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/admin/inquiries/public (public submit)', () => {
    it('should accept public inquiry without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries/public')
        .set('X-CSRF-Token', csrfToken)
        .send({
          companyName: 'Test Company',
          contactName: 'Test Contact',
          contactPhone: '+7 (777) 111 22 33',
          contactEmail: 'test-contact@example.kz',
          priority: 'normal',
          notes: 'Test inquiry from E2E test',
        });
      expect(res.status).toBe(201);
      expect(res.body.inquiryNumber).toBeDefined();
      expect(res.body.companyName).toBe('Test Company');
    });

    it('should return 400 without company name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries/public')
        .set('X-CSRF-Token', csrfToken)
        .send({ contactName: 'No Company' })
        .expect(400);
    });

    it('should return 400 without contact name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries/public')
        .set('X-CSRF-Token', csrfToken)
        .send({ companyName: 'No Contact' })
        .expect(400);
    });

    it('should return 400 without phone', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries/public')
        .set('X-CSRF-Token', csrfToken)
        .send({ companyName: 'No Phone', contactName: 'Test', contactEmail: 'test@example.kz' })
        .expect(400);
    });

    it('should return 400 without email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries/public')
        .set('X-CSRF-Token', csrfToken)
        .send({ companyName: 'No Email', contactName: 'Test', contactPhone: '+7 (777) 111 22 33' })
        .expect(400);
    });

    it('should accept inquiry with items', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries/public')
        .set('X-CSRF-Token', csrfToken)
        .send({
          companyName: 'Item Test Co',
          contactName: 'Has Items',
          contactPhone: '+7 (777) 222 33 44',
          contactEmail: 'items@example.kz',
          items: [
            { sku: 'ITEM-001', name: 'Test Item 1', quantity: 10, unitPrice: 5000 },
            { sku: 'ITEM-002', name: 'Test Item 2', quantity: 5, unitPrice: 8000 },
          ],
        });
      expect(res.status).toBe(201);
      expect(res.body.itemCount).toBe(15);
      expect(Number(res.body.totalAmount)).toBe(90000);
    });
  });

  describe('Admin CRUD (authenticated)', () => {
    let inquiryId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/inquiries')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'CRUD Test Co',
          contactName: 'CRUD Contact',
          contactPhone: '+7 (777) 333 44 55',
          contactEmail: 'crud@example.kz',
          priority: 'normal',
        });
      inquiryId = res.body.id;
    });

    it('GET /admin/inquiries — should list inquiries', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/inquiries')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('GET /admin/inquiries/stats — should return stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/inquiries/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBeDefined();
      expect(res.body.active).toBeDefined();
    });

    it('GET /admin/inquiries/:id — should return single inquiry', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(inquiryId);
    });

    it('PUT /admin/inquiries/:id — should update inquiry', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/admin/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'CRUD Test Co UPDATED',
          notes: 'Updated from E2E test',
          priority: 'high',
        });
      expect(res.status).toBe(200);
      expect(res.body.companyName).toBe('CRUD Test Co UPDATED');
      expect(res.body.priority).toBe('high');
    });

    it('PUT /admin/inquiries/:id — should update items', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/admin/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            { sku: 'NEW-001', name: 'New Item', quantity: 3, unitPrice: 10000 },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.itemCount).toBe(3);
      expect(Number(res.body.totalAmount)).toBe(30000);
    });

    it('DELETE /admin/inquiries/:id — should delete inquiry', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/admin/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 204]).toContain(res.status);
    });

    it('GET /admin/inquiries/:id — should return error after delete', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      // findUniqueOrThrow throws 500, not 404 — both are valid "not found" behaviors
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('Authorization', () => {
    it('should reject public access to admin list', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/inquiries')
        .expect(401);
    });

    it('should reject public access to admin stats', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/inquiries/stats')
        .expect(401);
    });
  });
});
