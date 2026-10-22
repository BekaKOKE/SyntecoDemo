import { Global, Module } from '@nestjs/common';
import { PinoLoggerService } from './logger.service';

/**
 * Global module that provides the PinoLoggerService throughout the application.
 * Import once in AppModule — all other modules get access via DI.
 */
@Global()
@Module({
  providers: [PinoLoggerService],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
