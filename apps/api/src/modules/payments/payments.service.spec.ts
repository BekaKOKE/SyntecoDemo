import { ErrorCode } from '../../common/errors/app-exception';
import { PaymentsService } from './payments.service';
import { PaymentGateway } from './payment-gateway.interface';

const order = (over: Record<string, unknown> = {}) => ({
  id: 'o1', orderNumber: 'SO-2026-000001', userId: 'u1', status: 'pending',
  paymentStatus: 'pending', total: 112000, ...over,
});

const fakeGateway = (method: string, pay: PaymentGateway['pay']): PaymentGateway =>
  ({ method: method as any, displayName: method, description: '', requiredFields: [], pay });

describe('PaymentsService', () => {
  let prisma: any;
  let tx: any;

  const build = (...gateways: PaymentGateway[]) => new PaymentsService(prisma, gateways);

  beforeEach(() => {
    tx = {
      payment: { create: jest.fn().mockResolvedValue({ id: 'pay-1' }) },
      order: { update: jest.fn() },
      orderStatusHistory: { create: jest.fn() },
    };
    prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(order()) },
      user: { findUnique: jest.fn().mockResolvedValue({ email: 'b@x.kz', phone: null, firstName: 'A', lastName: 'B' }) },
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
  });

  it('records a successful payment and auto-confirms a pending order', async () => {
    const service = build(fakeGateway('kaspi', async () => ({ status: 'paid', transactionId: 'K-1', message: 'ok' })));
    const r = await service.processOrderPayment({ orderId: 'o1', actorId: 'u1', method: 'kaspi' });

    expect(r).toMatchObject({ status: 'paid', orderConfirmed: true, paymentId: 'pay-1' });
    expect(tx.payment.create).toHaveBeenCalledWith({ data: expect.objectContaining({ status: 'paid', amount: 112000, externalId: 'K-1' }) });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { paymentMethod: 'kaspi', paymentStatus: 'paid', status: 'confirmed' },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalled();
  });

  it('records a declined payment without changing the order status', async () => {
    const service = build(fakeGateway('kaspi', async () => ({ status: 'failed', transactionId: null, message: 'declined' })));
    const r = await service.processOrderPayment({ orderId: 'o1', actorId: 'u1', method: 'kaspi' });

    expect(r).toMatchObject({ status: 'failed', orderConfirmed: false });
    expect(tx.order.update).toHaveBeenCalledWith({ where: { id: 'o1' }, data: { paymentMethod: 'kaspi', paymentStatus: 'failed' } });
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('converts an unexpected gateway crash into a failed payment', async () => {
    const service = build(fakeGateway('kaspi', async () => { throw new Error('ECONNRESET'); }));
    const r = await service.processOrderPayment({ orderId: 'o1', actorId: 'u1', method: 'kaspi' });
    expect(r.status).toBe('failed');
    expect(r.message).toContain('недоступен');
  });

  it('rejects unsupported methods, paid orders and cancelled orders', async () => {
    const service = build(fakeGateway('kaspi', async () => ({ status: 'paid', transactionId: null, message: '' })));

    await expect(service.processOrderPayment({ orderId: 'o1', actorId: 'u1', method: 'bitcoin' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.PAYMENT_METHOD_UNSUPPORTED });

    prisma.order.findUnique.mockResolvedValueOnce(order({ paymentStatus: 'paid' }));
    await expect(service.processOrderPayment({ orderId: 'o1', actorId: 'u1', method: 'kaspi' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.ORDER_ALREADY_PAID });

    prisma.order.findUnique.mockResolvedValueOnce(order({ status: 'cancelled' }));
    await expect(service.processOrderPayment({ orderId: 'o1', actorId: 'u1', method: 'kaspi' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.INVALID_TRANSITION });

    prisma.order.findUnique.mockResolvedValueOnce(null);
    await expect(service.processOrderPayment({ orderId: 'nope', actorId: 'u1', method: 'kaspi' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.ORDER_NOT_FOUND });
  });

  it('lists methods with their required fields', () => {
    const service = build(fakeGateway('kaspi', jest.fn()), fakeGateway('bank_invoice', jest.fn()));
    expect(service.listMethods().map(m => m.method)).toEqual(['kaspi', 'bank_invoice']);
  });
});
