import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api/v1', { exclude: ['health', 'api-docs'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 for missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'test123' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 401 for wrong credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz', password: 'wrongpassword123' });
      expect(res.status).toBe(401);
    });

    it('should return 4xx for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'no-reply@doesnotexist.kz', password: 'test123' });
      expect([400, 401]).toContain(res.status);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.length).toBeGreaterThan(20);
    });

    it('should return tokens with correct structure', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('expiresIn');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    const newUser = {
      email: `test-${Date.now()}@synteco.kz`,
      password: 'Test1234!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+77771112233',
      consent: true, // required since the personal-data consent migration
    };

    it('should return 400 for missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.kz' });
      expect(res.status).toBe(400);
    });

    it('should register a new user and return tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(newUser);
      expect([200, 201]).toContain(res.status);
      // Register returns tokens (TokenResponseDto), not user object
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should not register duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(newUser);
      expect([400, 409]).toContain(res.status);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
      refreshToken = res.body.refreshToken;
    });

    it('should return 401 for empty body (no refresh token)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(401);
    });

    it('should refresh token successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
      accessToken = res.body.accessToken;
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@synteco.kz');
      expect(res.body.role).toBeDefined();
    });
  });

  describe('RBAC — protected routes', () => {
    let adminToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'admin@synteco.kz', password: 'Admin123!' });
      adminToken = res.body.accessToken;
    });

    it('should reject unauthenticated access to admin routes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .expect(401);
    });

    it('should allow admin access to admin routes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.productCount).toBeDefined();
    });

    it('should allow unauthenticated access to products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?limit=5');
      expect(res.status).toBe(200);
    });
  });
});
