import { EmailNotifier, InAppNotifier, NotificationMessage, RealtimeNotifier, SmsNotifier } from './notifiers';
import { NotificationsService } from './notifications.service';

const message = (recipient: NotificationMessage['recipient']): NotificationMessage => ({
  userId: 'u1', orderId: 'o1', type: 'order_created', title: 'Заказ оформлен', body: 'Спасибо!', recipient,
});

describe('Decorator pattern — notification channels', () => {
  let prisma: any;
  let mailer: any;
  let events: any;

  beforeEach(() => {
    prisma = { notification: { create: jest.fn() } };
    mailer = { send: jest.fn() };
    const emit = jest.fn();
    events = { server: { to: jest.fn(() => ({ emit })) }, emit };
  });

  it('base component stores the notification in the database (in-app channel)', async () => {
    const channels = await new InAppNotifier(prisma).send(message({}));
    expect(channels).toEqual(['in_app']);
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'u1', type: 'order_created', channels: ['in_app'] }),
    });
  });

  it('stacked decorators deliver through every channel and record them', async () => {
    const notifier = new SmsNotifier(new EmailNotifier(new RealtimeNotifier(new InAppNotifier(prisma), events), mailer));
    const channels = await notifier.send(message({ email: 'a@b.kz', phone: '+77011234567' }));

    expect(channels).toEqual(['sms', 'email', 'websocket', 'in_app']);
    expect(mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@b.kz', subject: 'Synteco: Заказ оформлен' }));
    expect(events.server.to).toHaveBeenCalledWith('user:u1');
  });

  it('a channel without an address is skipped, the rest still work', async () => {
    const notifier = new SmsNotifier(new EmailNotifier(new InAppNotifier(prisma), mailer));
    const channels = await notifier.send(message({ email: 'a@b.kz', phone: null }));
    expect(channels).toEqual(['email', 'in_app']);
  });

  it('NotificationsService never throws when delivery fails', async () => {
    prisma.user = { findUnique: jest.fn().mockResolvedValue({ email: 'a@b.kz', phone: null }) };
    prisma.notification.create.mockRejectedValue(new Error('db down'));
    const service = new NotificationsService(prisma, mailer, events);
    await expect(service.notify({ userId: 'u1', type: 't', title: 't', body: 'b' })).resolves.toEqual([]);
  });
});
