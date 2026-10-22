import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { PinoLoggerService } from './common/logging/logger.service';

async function bootstrap() {
  // Bootstrap logger — structured JSON from the start
  const bootLogger = new PinoLoggerService();
  const logger = bootLogger.child({ module: 'bootstrap' });

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

  // ── Database connection retry with exponential backoff ──
  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: bootLogger, // Structured JSON logging for all NestJS output
        cors: {
          origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3001'],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Session-Id', 'X-CSRF-Token'],
          exposedHeaders: ['X-Request-Id'],
        },
      });

      // ── Security: Helmet with strict CSP ──────────────
      app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // strict — Swagger route relaxes this below
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:9000'],
            connectSrc: ["'self'", 'http://localhost:3001', 'http://localhost:3002'],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
          },
        },
        crossOriginEmbedderPolicy: false, // allow loading images from external CDNs
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to be loaded cross-origin
      }));

      // Relax CSP ONLY for the Swagger UI route (registered after helmet so it
      // overrides the strict header). swagger-ui genuinely needs inline scripts.
      app.use('/api-docs', (_req: any, res: any, next: any) => {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;",
        );
        next();
      });

      // ── Security: Additional headers ──────────────────
      app.use((_req: any, res: any, next: any) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '0'); // deprecated, CSP handles this — set to 0 to avoid false sense of security
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        if (process.env.NODE_ENV === 'production') {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        next();
      });

      // ── Global validation pipe ────────────────────────
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: { enableImplicitConversion: true },
        }),
        new SanitizePipe(),
      );

      // ── Global exception filter ──────────────────────
      app.useGlobalFilters(new AllExceptionsFilter(bootLogger));

      // ── Global audit interceptor ─────────────────────
      const prismaClient = app.get(PrismaClient);
      app.useGlobalInterceptors(new AuditInterceptor(bootLogger, prismaClient));

      // ── API prefix ────────────────────────────────────
      app.setGlobalPrefix('api/v1', {
        exclude: ['health', 'api-docs', 'uploads'],
      });

      // ── OpenAPI docs (B-09: never expose the API schema in production) ──
      // Enable in production only if SWAGGER_ENABLED=true is explicitly set.
      const swaggerEnabled =
        process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true';
      if (swaggerEnabled) {
        const config = new DocumentBuilder()
          .setTitle('Synteco API')
          .setDescription('B2B industrial supply (MRO) e-commerce platform for Kazakhstan')
          .setVersion('1.0')
          .addBearerAuth()
          .addServer('http://localhost:3000', 'Development')
          .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api-docs', app, document);
      }

      // ── Static file serving ───────────────────────────
      app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

      // ── Health check (no auth, checks DB + Redis) ──
      const httpAdapter = app.getHttpAdapter();
      httpAdapter.get('/health', async (_req: any, res: any) => {
        const checks: Record<string, string> = {};

        // PostgreSQL
        try {
          const prisma = app.get(PrismaClient);
          await prisma.$queryRaw`SELECT 1`;
          checks.postgres = 'ok';
        } catch {
          checks.postgres = 'error';
        }

        // Redis (non-critical — degraded if unavailable)
        try {
          const cache: any = app.get(CACHE_MANAGER);
          await cache.set('health', '1', 1000);
          await cache.get('health');
          checks.redis = 'ok';
        } catch {
          checks.redis = 'degraded';
        }

        const hasError = Object.values(checks).some(v => v === 'error');
        const allOk = Object.values(checks).every(v => v === 'ok');

        res.status(hasError ? 503 : 200).json({
          status: hasError ? 'down' : allOk ? 'ok' : 'degraded',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          checks,
        });
      });

      // ── Graceful shutdown ─────────────────────────────
      app.enableShutdownHooks();

      const port = process.env.PORT ?? 3000;
      await app.listen(port);
      logger.info(`Synteco API running on http://localhost:${port}`);
      logger.info(`API Docs: http://localhost:${port}/api-docs`);
      logger.info(`Helmet CSP + security headers active`);
      return; // success — exit retry loop
    } catch (err: any) {
      if (attempt < MAX_RETRIES && (
        err?.message?.includes('Connection') ||
        err?.message?.includes('connect') ||
        err?.code === 'ECONNREFUSED' ||
        err?.code === 'P1001'
      )) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        logger.warn({ attempt, maxRetries: MAX_RETRIES, delayMs: delay }, `Database not ready (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        logger.error({ err: err?.message, stack: err?.stack }, `Failed to start: ${err?.message}`);
        process.exit(1);
      }
    }
  }
}

bootstrap();
