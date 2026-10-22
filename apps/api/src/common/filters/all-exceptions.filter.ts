import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus,
} from '@nestjs/common';
import { PinoLoggerService } from '../logging/logger.service';
import { AppException, ErrorCode } from '../errors/app-exception';
import type { ProblemDetail } from '../errors/app-exception';

/**
 * Global exception filter — catches all unhandled exceptions and returns
 * RFC 7807 Problem Details JSON responses.
 *
 * In production, stack traces are stripped.
 * Every response includes a requestId for correlation.
 * All errors are logged in structured JSON format.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly errorLogger: ReturnType<PinoLoggerService['child']>;

  constructor(private readonly logger: PinoLoggerService) {
    this.errorLogger = this.logger.child({ module: 'exception-filter' });
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();
    const requestId = request.requestId ?? 'unknown';
    const method = request.method ?? 'UNKNOWN';
    const path = request.originalUrl ?? request.url ?? '/';
    const userId = request.user?.id ?? 'anonymous';
    const isProduction = process.env.NODE_ENV === 'production';

    const problem = this.toProblemDetail(exception, requestId, path, isProduction);

    // Structured logging
    if (problem.status >= 500) {
      this.errorLogger.error({
        requestId, method, path, statusCode: problem.status, userId,
        errorCode: problem.errorCode, detail: problem.detail,
        stack: exception instanceof Error ? exception.stack : undefined,
        msg: `${method} ${path} ${problem.status} — ${problem.errorCode}: ${problem.detail}`,
      });
    } else {
      this.errorLogger.warn({
        requestId, method, path, statusCode: problem.status, userId,
        errorCode: problem.errorCode, detail: problem.detail,
        msg: `${method} ${path} ${problem.status} — ${problem.errorCode}`,
      });
    }

    response.status(problem.status).json(problem);
  }

  private toProblemDetail(
    exception: unknown,
    requestId: string,
    path: string,
    isProduction: boolean,
  ): ProblemDetail {
    // 1. Our own AppException — already has all the info
    if (exception instanceof AppException) {
      const res = exception.getResponse() as any;
      return {
        type: `https://api.synteco.kz/errors/${exception.errorCode}`,
        title: this.errorCodeToTitle(exception.errorCode),
        status: exception.getStatus(),
        detail: res.message ?? exception.message,
        instance: path,
        errorCode: exception.errorCode,
        errors: res.errors,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. NestJS HttpException (built-in guards, pipes, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const detail = typeof res === 'string' ? res : (res as any).message ?? exception.message;
      const code = this.statusToErrorCode(status);

      return {
        type: `https://api.synteco.kz/errors/${code}`,
        title: this.errorCodeToTitle(code),
        status,
        detail: Array.isArray(detail) ? detail.join('; ') : String(detail),
        instance: path,
        errorCode: code,
        errors: !Array.isArray(detail) && typeof detail === 'object' ? (detail as any).errors : undefined,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Unknown errors — 500 with sanitized message
    const message = exception instanceof Error ? exception.message : String(exception);
    return {
      type: `https://api.synteco.kz/errors/${ErrorCode.INTERNAL_ERROR}`,
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: isProduction ? 'An unexpected error occurred' : message,
      instance: path,
      errorCode: ErrorCode.INTERNAL_ERROR,
      requestId,
      timestamp: new Date().toISOString(),
      ...(isProduction ? {} : { stack: exception instanceof Error ? exception.stack : undefined } as any),
    };
  }

  private errorCodeToTitle(code: string): string {
    return code
      .split('_')
      .map(w => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  }

  private statusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400: return ErrorCode.VALIDATION_ERROR;
      case 401: return ErrorCode.INVALID_CREDENTIALS;
      case 403: return ErrorCode.INSUFFICIENT_ROLE;
      case 404: return ErrorCode.NOT_FOUND;
      case 409: return ErrorCode.IDEMPOTENCY_CONFLICT;
      case 429: return ErrorCode.RATE_LIMITED;
      default: return ErrorCode.INTERNAL_ERROR;
    }
  }
}
