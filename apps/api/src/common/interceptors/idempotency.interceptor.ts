import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Observable, of, tap } from 'rxjs';
import { PinoLoggerService } from '../logging/logger.service';

const IDEMPOTENCY_HEADER = 'x-idempotency-key';
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Idempotency interceptor — prevents duplicate mutations.
 *
 * Clients send an X-Idempotency-Key header on POST/PUT/PATCH/DELETE requests.
 * The first request with a given key is processed normally and its response
 * is cached. Subsequent requests with the same key return the cached
 * response — no duplicate processing occurs.
 *
 * Uses Redis for storage (survives restarts, works across instances).
 * Falls back to in-memory Map if Redis is unavailable.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly memoryStore = new Map<string, { body: string; status: number; expiresAt: number }>();

  constructor(
    private readonly logger: PinoLoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: any,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<any>();
    const method = request.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const key = request.headers?.[IDEMPOTENCY_HEADER];
    if (!key || typeof key !== 'string' || key.length < 8) {
      return next.handle();
    }

    const requestId = request.requestId ?? 'unknown';
    const cacheKey = `idempotency:${key}`;

    // Try Redis first, fall back to memory
    return new Observable(subscriber => {
      this.checkCache(cacheKey).then(cached => {
        if (cached && cached.expiresAt > Date.now()) {
          this.logger.raw().info({
            requestId, idempotencyKey: key, method, path: request.url,
            msg: 'Idempotency cache hit — returning cached response',
          });
          const response = context.switchToHttp().getResponse();
          response.status(cached.status);
          subscriber.next(JSON.parse(cached.body));
          subscriber.complete();
          return;
        }

        // First request — process and cache
        next.handle().pipe(
          tap({
            next: (body: any) => {
              const status = context.switchToHttp().getResponse().statusCode || 200;
              const entry = {
                body: JSON.stringify(body),
                status,
                expiresAt: Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000,
              };
              this.storeCache(cacheKey, entry);
              this.logger.raw().debug({
                requestId, idempotencyKey: key, method,
                msg: `Idempotency key stored (TTL: ${IDEMPOTENCY_TTL_SECONDS}s)`,
              });
            },
            error: () => {
              // Don't cache failed operations — let client retry
            },
          }),
        ).subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }

  private async checkCache(key: string): Promise<{ body: string; status: number; expiresAt: number } | null> {
    // Try Redis
    try {
      const cached = await this.cacheManager.get(key);
      if (cached) return cached as any;
    } catch {
      // Redis unavailable — try memory
    }

    // Fallback to memory
    const mem = this.memoryStore.get(key);
    if (mem) return mem;

    return null;
  }

  private async storeCache(key: string, entry: { body: string; status: number; expiresAt: number }): Promise<void> {
    // Store in memory (always available)
    this.memoryStore.set(key, entry);

    // Try Redis
    try {
      await this.cacheManager.set(key, entry, Math.floor(IDEMPOTENCY_TTL_SECONDS * 1000));
    } catch {
      // Redis unavailable — memory is sufficient for single-instance
    }
  }
}
