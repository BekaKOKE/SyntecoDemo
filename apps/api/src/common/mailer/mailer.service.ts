import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

export interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends transactional email via SMTP.
 *
 * Configuration (env):
 *   SMTP_HOST       — e.g. smtp.gmail.com
 *   SMTP_PORT       — 465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER       — login, e.g. shop@example.com
 *   SMTP_PASS       — app password (NOT the account password)
 *   MAIL_FROM       — sender address, e.g. "Synteco <shop@example.com>"
 *   MAIL_TO_INQUIRIES — recipient for inquiry notifications (defaults to MAIL_FROM)
 *
 * If SMTP_HOST is absent, mail becomes a no-op that only logs — so the API
 * still starts without SMTP configured (tests, local dev).
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter | null = null;
  private readonly from: string;
  private readonly inquiryRecipient: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 465);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from =
      this.config.get<string>('MAIL_FROM') ||
      (user ? `Synteco <${user}>` : 'Synteco <no-reply@synteco.kz>');
    this.inquiryRecipient =
      this.config.get<string>('MAIL_TO_INQUIRIES') || this.from;

    if (host && user && pass) {
      this.transporter = createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transport configured for ${user}@${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing). Email sending is disabled.',
      );
    }
  }

  /** True if a real SMTP transport is available. */
  get isEnabled(): boolean {
    return this.transporter !== null;
  }

  /** Default recipient for inquiry notifications. */
  get inquiryTo(): string {
    return this.inquiryRecipient;
  }

  /** Send a transactional email. No-op (with log) if SMTP is disabled. */
  async send(opts: MailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[mail:disabled] To: ${Array.isArray(opts.to) ? opts.to.join(',') : opts.to} | Subject: ${opts.subject}`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(opts.to) ? opts.to.join(',') : opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      });
      this.logger.log(
        `Email sent to ${Array.isArray(opts.to) ? opts.to.join(',') : opts.to}: "${opts.subject}"`,
      );
    } catch (err: any) {
      // Email failure must not break inquiry creation — log and move on
      this.logger.error(
        `Failed to send email "${opts.subject}": ${err?.message ?? err}`,
      );
    }
  }
}
