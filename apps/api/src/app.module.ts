import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ThrottlerModule } from '@nestjs/throttler';
import { TestThrottlerGuard } from './common/guards/test-throttler.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './common/logging/logger.module';
import { EventsModule } from './common/events/events.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { LoggingInterceptor } from './common/logging/logging.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { SearchModule } from './modules/search/search.module';
import { UsersModule } from './modules/users/users.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { AdminModule } from './modules/admin/admin.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PrismaModule } from './config/prisma.module';
import { MailerModule } from './common/mailer/mailer.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { CsrfController } from './common/csrf/csrf.controller';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Redis caching — uses REDIS_URL from .env (with fallback to in-memory)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        if (redisUrl) {
          try {
            // Parse REDIS_URL to pass explicit password (avoids NOAUTH issues on reconnect)
            const parsed = new URL(redisUrl);
            const store = await redisStore({
              host: parsed.hostname || 'localhost',
              port: Number(parsed.port) || 6379,
              password: parsed.password || undefined,
              db: Number(parsed.pathname?.replace('/', '') || 0),
              ttl: 300 * 1000, // 5 min default TTL in ms
              retryStrategy: (times: number) => Math.min(times * 100, 3000),
              maxRetriesPerRequest: 3,
              lazyConnect: true,
            });
            // Attach error handler to avoid unhandled error events
            const client = (store as any)?.client;
            if (client) {
              client.on('error', (err: Error) => {
                // Log but don't crash — cache operations fall back gracefully.
                // eslint-disable-next-line no-console
                console.error(`[redis] connection error: ${err?.message ?? err}`);
              });
            }
            return { store };
          } catch {
            // Redis unavailable — fall back to in-memory cache
            return { ttl: 300 * 1000 };
          }
        }
        return { ttl: 300 * 1000 };
      },
    }),

    // Rate limiting: per-endpoint limits defined in controllers
    // In test mode: use high limits so e2e tests don't hit throttles
    ThrottlerModule.forRoot([{
      ttl: process.env.NODE_ENV === 'test' ? 1000 : 60000,
      limit: process.env.NODE_ENV === 'test' ? 10000 : 100,
    }]),

    // Scheduled tasks (cron)
    ScheduleModule.forRoot(),

    // Structured logging
    LoggerModule,

    // WebSocket real-time events
    EventsModule,

    // Prometheus metrics
    MetricsModule,

    // Database
    PrismaModule,

    // Transactional email (SMTP) — global, degrades to no-op if unconfigured
    MailerModule,

    // Domain modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    SearchModule,
    CartModule,
    OrdersModule,
    InventoryModule,
    PricingModule,
    PromotionsModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [CsrfController],
  providers: [
    // Global auth guard — all endpoints require JWT unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global rate limit guard
    { provide: APP_GUARD, useClass: TestThrottlerGuard },
    // Global roles guard
    { provide: APP_GUARD, useClass: RolesGuard },
    // CSRF guard — validates X-CSRF-Token on @CsrfRequired() endpoints
    { provide: APP_GUARD, useClass: CsrfGuard },
    // Global request logging interceptor
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // Idempotency — prevents duplicate mutations
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
