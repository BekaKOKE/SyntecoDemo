import { Module, Global } from '@nestjs/common';
import { MailerService } from './mailer.service';

/**
 * Mailer module — provides MailerService globally for sending transactional
 * email (e.g. inquiry notifications to the sales mailbox).
 *
 * Reads SMTP_* env vars via MailerService. If SMTP is not configured, the
 * service degrades to no-op + log so the app keeps working (useful in tests
 * and local dev without SMTP credentials).
 */
@Global()
@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
