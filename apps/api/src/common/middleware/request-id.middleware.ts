import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

/**
 * Attaches a unique correlation ID to every request.
 * Uses incoming X-Request-Id header if present (for distributed tracing),
 * otherwise generates a new UUID.
 * The ID is available on req.requestId and returned in the X-Request-Id response header.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestId = (req.headers?.['x-request-id'] as string) || uuid();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}
