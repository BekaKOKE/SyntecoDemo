import { Controller, Get, Req } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { generateCsrfToken } from '../guards/csrf.guard';

/**
 * CSRF Token endpoint — returns a stateless HMAC-signed token
 * for use with X-CSRF-Token header on public mutation endpoints.
 *
 * GET /api/v1/csrf-token → { token: "..." }
 *
 * Tokens are valid for 8 hours and verified by CsrfGuard.
 */
@Controller('csrf-token')
export class CsrfController {
  @Get()
  @Public()
  getToken(@Req() req: any): { token: string; expiresIn: number } {
    // Use session ID or request fingerprint as the token subject
    const clientId = req.headers?.['x-session-id'] ?? req.ip ?? 'anonymous';
    const token = generateCsrfToken(clientId);

    return {
      token,
      expiresIn: 8 * 60 * 60, // 8 hours in seconds
    };
  }
}
