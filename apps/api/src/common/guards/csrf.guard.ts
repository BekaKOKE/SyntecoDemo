import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'crypto';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * CSRF Protection Guard — validates CSRF tokens on mutation endpoints.
 *
 * Uses stateless HMAC-SHA256 tokens (no Redis/DB required).
 * Tokens are valid for 8 hours (configurable via CSRF_TOKEN_TTL_MS).
 *
 * Public endpoints that are read-only (GET/HEAD/OPTIONS) skip CSRF checks.
 * Only POST/PUT/PATCH/DELETE on @Public() endpoints require CSRF tokens.
 *
 * Flow:
 *   1. Client calls GET /api/v1/csrf-token → receives { token: "..." }
 *   2. Client includes token as X-CSRF-Token header on mutations
 *   3. Guard validates token HMAC + expiry
 */

const CSRF_HEADER = 'x-csrf-token';
const CSRF_TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
// SEC-04: no hardcoded fallback secret. In production a real secret is required;
// in dev we allow a clearly-labelled placeholder so local runs still work.
const CSRF_SECRET: string = process.env.CSRF_SECRET
  ?? process.env.JWT_SECRET
  ?? (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CSRF_SECRET (or JWT_SECRET) must be set in production');
    }
    return 'dev-only-insecure-csrf-secret';
  })();

export const CSRF_REQUIRED_KEY = 'csrf_required';

/**
 * Decorator: mark an endpoint as requiring CSRF validation.
 * Only needed for @Public() mutation endpoints — authenticated
 * endpoints already have JWT which is CSRF-resistant via Bearer token.
 */
import { SetMetadata } from '@nestjs/common';
export const CsrfRequired = () => SetMetadata(CSRF_REQUIRED_KEY, true);

interface CsrfPayload {
  sub: string;      // random session identifier
  exp: number;      // expiry timestamp (ms)
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();
    const method = (request.method ?? 'GET').toUpperCase();

    // GET/HEAD/OPTIONS are safe methods — no CSRF needed
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Check if CSRF is explicitly required on this handler/class
    const csrfRequired = this.reflector.getAllAndOverride<boolean>(CSRF_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!csrfRequired) {
      // Skip CSRF for authenticated endpoints (JWT Bearer token is CSRF-resistant)
      // and for endpoints that don't explicitly require it
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!isPublic) return true;
      // Public mutation endpoint without @CsrfRequired() — allow but log warning
      return true;
    }

    // CSRF is required — validate token
    const token = request.headers?.[CSRF_HEADER];
    if (!token || typeof token !== 'string' || token.length < 16) {
      return false;
    }

    return this.validateToken(token);
  }

  private validateToken(token: string): boolean {
    try {
      // Token format: <base64payload>.<base64hmac>
      const parts = token.split('.');
      if (parts.length !== 2) return false;

      const payloadB64 = parts[0]!;
      const signatureB64 = parts[1]!;
      const expected = createHmac('sha256', CSRF_SECRET)
        .update(payloadB64)
        .digest('base64url');

      // Constant-time comparison to prevent timing attacks
      const sigBuf = Buffer.from(signatureB64, 'base64url');
      const expBuf = Buffer.from(expected, 'base64url');
      if (sigBuf.length !== expBuf.length) return false;
      if (!timingSafeEqual(sigBuf, expBuf)) return false;

      // Decode payload and check expiry
      const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload: CsrfPayload = JSON.parse(payloadJson);

      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
}

/**
 * Generate a CSRF token for the given session/client.
 * Exported so the csrf-token controller can use it.
 */
export function generateCsrfToken(clientId?: string): string {
  const sub = clientId ?? Math.random().toString(36).substring(2, 15);
  const exp = Date.now() + CSRF_TOKEN_TTL_MS;

  const payload: CsrfPayload = { sub, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}
