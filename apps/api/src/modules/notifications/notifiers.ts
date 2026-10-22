import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MailerService } from '../../common/mailer/mailer.service';
import { EventsGateway } from '../../common/events/events.gateway';

/**
 * DECORATOR PATTERN (second use) — notification channels.
 *
 * InAppNotifier is the concrete component: it stores the notification in the
 * database (customer.notifications) so it is shown in the personal account.
 * Channel decorators deliver the same message through one more channel and
 * then delegate to the wrapped notifier, which records the full channel list.
 *
 *   new SmsNotifier(new EmailNotifier(new RealtimeNotifier(new InAppNotifier(prisma))))
 */

export interface NotificationMessage {
  userId: string;
  orderId?: string | null;
  type: string;
  title: string;
  body: string;
  recipient: { email?: string | null; phone?: string | null };
}

export interface Notifier {
  /** Returns every channel the message went through. */
  send(message: NotificationMessage, deliveredVia?: string[]): Promise<string[]>;
}

export class InAppNotifier implements Notifier {
  constructor(private readonly prisma: PrismaClient) {}

  async send(message: NotificationMessage, deliveredVia: string[] = []): Promise<string[]> {
    const channels = [...deliveredVia, 'in_app'];
    await this.prisma.notification.create({
      data: {
        userId: message.userId,
        orderId: message.orderId ?? null,
        type: message.type,
        title: message.title,
        body: message.body,
        channels,
      },
    });
    return channels;
  }
}

export abstract class NotifierDecorator implements Notifier {
  protected abstract readonly channel: string;

  constructor(protected readonly inner: Notifier) {}

  /** Delivers through this decorator's channel; false = skipped (no address). */
  protected abstract deliver(message: NotificationMessage): Promise<boolean>;

  async send(message: NotificationMessage, deliveredVia: string[] = []): Promise<string[]> {
    const delivered = await this.deliver(message);
    return this.inner.send(message, delivered ? [...deliveredVia, this.channel] : deliveredVia);
  }
}

/** Email channel — real SMTP when configured, otherwise MailerService logs it. */
export class EmailNotifier extends NotifierDecorator {
  protected readonly channel = 'email';

  constructor(inner: Notifier, private readonly mailer: MailerService) {
    super(inner);
  }

  protected async deliver(message: NotificationMessage): Promise<boolean> {
    if (!message.recipient.email) return false;
    await this.mailer.send({ to: message.recipient.email, subject: `Synteco: ${message.title}`, text: message.body });
    return true;
  }
}

/** SMS channel — simulated SMS provider (logs the text). */
export class SmsNotifier extends NotifierDecorator {
  protected readonly channel = 'sms';
  private readonly logger = new Logger('SmsNotifier');

  protected async deliver(message: NotificationMessage): Promise<boolean> {
    if (!message.recipient.phone) return false;
    this.logger.log(`[sms:simulated] To ${message.recipient.phone}: ${message.title}`);
    return true;
  }
}

/** Real-time channel — pushes the event to open browser tabs via WebSocket. */
export class RealtimeNotifier extends NotifierDecorator {
  protected readonly channel = 'websocket';

  constructor(inner: Notifier, private readonly events?: EventsGateway) {
    super(inner);
  }

  protected async deliver(message: NotificationMessage): Promise<boolean> {
    if (!this.events?.server) return false;
    this.events.server.to(`user:${message.userId}`).emit('notification', {
      type: message.type, title: message.title, body: message.body, orderId: message.orderId ?? null,
    });
    return true;
  }
}
