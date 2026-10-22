import { LoggerService, Injectable } from '@nestjs/common';
import pino from 'pino';

/**
 * Structured JSON logger backed by pino.
 *
 * In development: pretty-printed output via pino-pretty.
 * In production/test: newline-delimited JSON for log aggregation.
 *
 * Every log line automatically includes:
 *   - timestamp (ISO 8601)
 *   - level (trace/debug/info/warn/error/fatal)
 *   - pid (process ID)
 *   - hostname
 *
 * Consumers can attach context via the child() method:
 *   logger.child({ requestId, userId }).info('...')
 */
@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    const isDev = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';

    this.logger = pino({
      level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
      ...(isDev && !isTest
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss.l',
                ignore: 'pid,hostname',
                singleLine: true,
              },
            },
          }
        : {}),
      // In test mode: suppress all logs by default
      ...(isTest ? { level: 'silent' } : {}),
      formatters: {
        level(label) {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // Redact sensitive fields from logs
      redact: {
        paths: [
          'password',
          'passwordHash',
          'accessToken',
          'refreshToken',
          'authorization',
          'cookie',
          'body.password',
          'body.passwordHash',
        ],
        censor: '[REDACTED]',
      },
    });
  }

  /** Create a child logger with additional bound context */
  child(bindings: Record<string, unknown>): pino.Logger {
    return this.logger.child(bindings);
  }

  /** Get the raw pino logger for direct use */
  raw(): pino.Logger {
    return this.logger;
  }

  log(message: any, ...optionalParams: any[]) {
    this.info(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    const stack = optionalParams.find(p => typeof p === 'string' && p.includes('\n'));
    this.logger.error({ err: stack ? { message, stack } : { message } }, String(message));
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(String(message));
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(String(message));
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.trace(String(message));
  }

  info(message: any, ...optionalParams: any[]) {
    this.logger.info(String(message));
  }
}
