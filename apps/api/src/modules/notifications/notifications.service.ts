import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { MailerService } from '../../common/mailer/mailer.service';
import { EventsGateway } from '../../common/events/events.gateway';
import {
  EmailNotifier, InAppNotifier, Notifier, RealtimeNotifier, SmsNotifier,
} from './notifiers';

export interface NotifyInput {
  userId: string;
  orderId?: string | null;
  type: string;
  title: string;
  body: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notifier: Notifier;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly mailer: MailerService,
    @Optional() private readonly events?: EventsGateway,
  ) {
    // Channels are composed once; add or remove a channel by changing this line only.
    this.notifier = new SmsNotifier(
      new EmailNotifier(
        new RealtimeNotifier(new InAppNotifier(this.prisma), this.events),
        this.mailer,
      ),
    );
  }

  /** Never throws: a failed notification must not break the order flow. */
  async notify(input: NotifyInput): Promise<string[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, phone: true },
      });
      return await this.notifier.send({ ...input, recipient: { email: user?.email, phone: user?.phone } });
    } catch (err) {
      this.logger.error(`Notification "${input.type}" for ${input.userId} failed: ${(err as Error)?.message}`);
      return [];
    }
  }

  async listForUser(userId: string, limit = 30) {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(Math.max(limit, 1), 100),
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { data: items, unread };
  }

  async markRead(userId: string, id: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) {
      throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND, `Notification ${id} not found`);
    }
    return this.prisma.notification.update({ where: { id }, data: { readAt: n.readAt ?? new Date() } });
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: count };
  }
}
