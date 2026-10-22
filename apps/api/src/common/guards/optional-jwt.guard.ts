import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard but does NOT reject unauthenticated requests.
 * Extracts user from JWT if present, otherwise passes through with no user.
 * Used for endpoints that work for both guests and authenticated users (e.g., cart).
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw on missing/invalid token — just return null user
    return user ?? null;
  }
}
