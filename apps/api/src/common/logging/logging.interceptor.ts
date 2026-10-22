import {
  Injectable, Optional, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PinoLoggerService } from './logger.service';
import { MetricsService } from '../metrics/metrics.service';

/**
 * Logs every HTTP request in structured JSON format.
 *
 * Captures:
 *   - requestId (correlation ID, propagated from X-Request-Id header)
 *   - method (GET, POST, etc.)
 *   - path (URL path)
 *   - statusCode (HTTP response status)
 *   - duration (response time in ms)
 *   - userId (authenticated user, or 'anonymous')
 *   - userAgent (client user-agent header)
 *   - contentLength (response body size, if available)
 *
 * Health check and API docs routes are excluded from logging to reduce noise.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly EXCLUDED_PATHS = ['/health', '/api-docs'];

  constructor(
    private readonly logger: PinoLoggerService,
    @Optional() private readonly metrics?: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<any>();
    const method = request.method;
    const path = request.originalUrl ?? request.url ?? '/';
    const requestId = request.requestId ?? 'unknown';
    const userId = request.user?.id ?? 'anonymous';
    const userAgent = (request.headers?.['user-agent'] ?? '').slice(0, 200);

    // Skip logging for health check and API docs
    if (this.EXCLUDED_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
      return next.handle();
    }

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: (body: any) => {
          const duration = Date.now() - start;
          const statusCode = 200;
          this.metrics?.increment('http_requests_total');
          this.metrics?.increment('http_requests_2xx');
          const contentLength = body ? JSON.stringify(body).length : 0;

          this.logger.raw().info({
            requestId,
            method,
            path,
            statusCode,
            duration,
            userId,
            userAgent,
            contentLength,
            msg: `${method} ${path} ${statusCode} ${duration}ms`,
          });
        },
        error: (error: any) => {
          const duration = Date.now() - start;
          const statusCode = error?.status ?? error?.statusCode ?? 500;
          this.metrics?.increment('http_requests_total');
          this.metrics?.increment(statusCode >= 500 ? 'http_requests_5xx' : 'http_requests_4xx');

          this.logger.raw().warn({
            requestId,
            method,
            path,
            statusCode,
            duration,
            userId,
            userAgent,
            error: error?.message ?? String(error),
            msg: `${method} ${path} ${statusCode} ${duration}ms — ${error?.message}`,
          });
        },
      }),
    );
  }
}
