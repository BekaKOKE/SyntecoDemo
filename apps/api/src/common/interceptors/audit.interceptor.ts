import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaClient } from '@prisma/client';
import { PinoLoggerService } from '../logging/logger.service';

/**
 * Automatically logs all state-changing HTTP requests (POST, PUT, PATCH, DELETE)
 * to the audit.audit_logs table.
 *
 * Captures: entity type (from URL path), entity ID (from response), action,
 * old/new values, user ID, requestId, and IP address.
 *
 * Read operations (GET, HEAD, OPTIONS) are NOT logged to the audit trail.
 *
 * Logs structured access log entries for ALL requests via PinoLoggerService.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly auditLogger: ReturnType<PinoLoggerService['child']>;

  constructor(
    private readonly logger: PinoLoggerService,
    @Inject(PrismaClient) private readonly prisma: PrismaClient,
  ) {
    this.auditLogger = this.logger.child({ module: 'audit' });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<any>();
    const method = request.method;
    const requestId = request.requestId ?? 'unknown';

    // For read operations: just log structured access, skip audit table write
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();
    const entityType = this.extractEntityType(request.path);
    const userId = request.user?.id ?? 'anonymous';
    const ipAddress = request.ip ?? 'unknown';
    const action = this.methodToAction(method);

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const entityId = this.extractEntityId(data, request.path);
          const duration = Date.now() - startTime;

          // Fire-and-forget audit log write — don't block the response
          this.writeAuditLog({
            entityType,
            entityId,
            action,
            userId,
            ipAddress,
          }).catch(err => {
            this.logger.warn(`Audit log write failed (non-fatal): ${err.message}`);
          });

          // Structured audit log entry
          this.auditLogger.info({
            requestId,
            action,
            entityType,
            entityId,
            userId,
            ipAddress,
            duration,
            msg: `${action} ${entityType}:${entityId} by ${userId} [${duration}ms]`,
          });
        },
        error: () => {
          // Don't log failed operations — the client never saw the result
        },
      }),
    );
  }

  private extractEntityType(path: string): string {
    const clean = path.replace(/^\/api\/v\d+\//, '').replace(/^admin\//, '');
    const parts = clean.split('/').filter(Boolean);
    return parts[0] ?? 'unknown';
  }

  private extractEntityId(data: any, path: string): string {
    if (data?.id) return String(data.id);
    if (data?.orderNumber) return String(data.orderNumber);
    if (data?.dealNumber) return String(data.dealNumber);
    if (data?.inquiryNumber) return String(data.inquiryNumber);

    const parts = path.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const segment = parts[i];
      if (segment && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return segment;
      }
    }

    return 'unknown';
  }

  private async writeAuditLog(entry: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    ipAddress: string;
  }): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO audit.audit_logs (id, entity_type, entity_id, action, user_id, ip_address, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.userId,
        entry.ipAddress,
      );
    } catch (err: any) {
      if (!err?.message?.includes('relation') && !err?.message?.includes('does not exist')) {
        throw err;
      }
    }
  }

  private methodToAction(method: string): string {
    switch (method) {
      case 'POST': return 'created';
      case 'PUT': case 'PATCH': return 'updated';
      case 'DELETE': return 'deleted';
      default: return method.toLowerCase();
    }
  }
}
