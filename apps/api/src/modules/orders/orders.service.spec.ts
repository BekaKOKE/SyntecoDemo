import { ErrorCode } from '../../common/errors/app-exception';
import { OrdersService } from './orders.service';
import { PromotionsService } from '../promotions/promotions.service';
import {
  DiscountStrategyRegistry, FixedAmountDiscountStrategy, PercentageDiscountStrategy,
} from '../promotions/strategies';

const CUSTOMER = 'user-customer';
const OTHER = 'user-other';
const ADMIN = 'user-admin';

const cart = {
  id: 'cart-1',
  items: [
    { id: 'ci-1', productId: 'p-gloves', variantId: 'GL-1', title: 'Перчатки', quantity: 10, unitPrice: 2000, totalPrice: 20000 },
    { id: 'ci-2', productId: 'p-helmet', variantId: 'HL-1', title: 'Каска', quantity: 2, unitPrice: 15000, totalPrice: 30000 },
  ],
};

const storedOrder = (over: Record<string, unknown> = {}) => ({
  id: 'order-1', orderNumber: 'SO-2026-000001', userId: CUSTOMER, status: 'pending',
  subtotal: 50000, discount: 0, vat: 6000, total: 56000, notes: null,
  promoCode: null, discountStrategy: null, services: [], servicesTotal: 0,
  paymentMethod: 'kaspi', paymentStatus: 'pending', payments: [],
  items: [], statusHistory: [], createdAt: new Date(), updatedAt: new Date(),
  ...over,
});

describe('OrdersService — main order workflows', () => {
  let prisma: any;
  let tx: any;
  let cartService: any;
  let inventory: any;
  let payments: any;
  let notifications: any;
  let service: OrdersService;

  beforeEach(() => {
    tx = {
      order: { create: jest.fn(), update: jest.fn(({ data }) => Promise.resolve(storedOrder(data))) },
      orderItem: { createMany: jest.fn(), findMany: jest.fn().mockResolvedValue(cart.items) },
      orderStatusHistory: { create: jest.fn() },
      promotion: { update: jest.fn() },
      payment: { create: jest.fn() },
      productStock: { findFirst: jest.fn().mockResolvedValue({ warehouseId: 'wh-1' }) },
    };
    prisma = {
      order: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(storedOrder()),
      },
      promotion: {
        findUnique: jest.fn(({ where }) => Promise.resolve(where.code === 'SAFETY10' ? {
          id: 'promo-1', code: 'SAFETY10', name: 'Скидка 10%', strategy: 'percentage', value: 10,
          params: {}, minOrderAmount: 0, usageLimit: null, usedCount: 0, isActive: true, validFrom: null, validTo: null,
        } : null)),
      },
      product: { findMany: jest.fn().mockResolvedValue([]) },
      user: {
        findUnique: jest.fn(({ where }) => Promise.resolve(
          where.id === ADMIN ? { id: ADMIN, role: 'admin' } : { id: where.id, role: 'customer_buyer', firstName: 'И', lastName: 'П', email: 'c@x.kz', phone: null },
        )),
      },
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
    cartService = { getCart: jest.fn().mockResolvedValue(cart), clearCart: jest.fn() };
    inventory = {
      getBulkAvailability: jest.fn().mockResolvedValue(new Map([['p-gloves', { available: 100 }], ['p-helmet', { available: 5 }]])),
      reserveAcrossWarehouses: jest.fn(),
      releaseAllReserved: jest.fn(),
      deduct: jest.fn(),
    };
    payments = {
      getGateway: jest.fn((method: string) => {
        if (method === 'bitcoin') throw Object.assign(new Error('unsupported'), { errorCode: ErrorCode.PAYMENT_METHOD_UNSUPPORTED });
        return { method };
      }),
      processOrderPayment: jest.fn().mockResolvedValue({ status: 'paid', message: 'Оплачено', transactionId: 'K-1', orderConfirmed: true }),
    };
    notifications = { notify: jest.fn().mockResolvedValue(['in_app']) };

    const promotions = new PromotionsService(
      prisma,
      new DiscountStrategyRegistry([new PercentageDiscountStrategy(), new FixedAmountDiscountStrategy()]),
    );
    service = new OrdersService(prisma, cartService, inventory, promotions, payments, notifications);
  });

  // ── TC-01 ──
  it('quote: applies promo strategy, service decorators and 12% VAT', async () => {
    const q = await service.quote(CUSTOMER, { promoCode: 'safety10', services: ['express_delivery'] });

    expect(q.subtotal).toBe(50000);
    expect(q.discount).toBe(5000);              // 10%
    expect(q.servicesTotal).toBe(7500);         // express delivery
    // VAT per goods line (2400 + 3600) + 12% of (7500 − 5000)
    expect(q.vat).toBe(6000 + 300);
    expect(q.total).toBe(50000 - 5000 + 7500 + 6300);
    expect(q.lines.map(l => l.code)).toEqual(['goods', 'discount', 'express_delivery', 'vat']);
  });

  // ── TC-02 ──
  it('create: reserves stock, stores the breakdown, counts the promo, clears the cart, charges and notifies', async () => {
    const order = await service.create(CUSTOMER, {
      promoCode: 'SAFETY10', services: ['certificates'], paymentMethod: 'kaspi', paymentDetails: { phone: '+77011234567' },
    });

    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: CUSTOMER, status: 'pending', subtotal: 50000, discount: 5000, servicesTotal: 2500,
        promoCode: 'SAFETY10', discountStrategy: 'percentage', paymentMethod: 'kaspi', paymentStatus: 'pending',
      }),
    });
    expect(tx.orderItem.createMany).toHaveBeenCalled();
    expect(inventory.reserveAcrossWarehouses).toHaveBeenCalledTimes(2);
    expect(tx.promotion.update).toHaveBeenCalledWith({ where: { id: 'promo-1' }, data: { usedCount: { increment: 1 } } });
    expect(cartService.clearCart).toHaveBeenCalledWith(CUSTOMER);
    expect(payments.processOrderPayment).toHaveBeenCalledWith(expect.objectContaining({ method: 'kaspi' }));
    expect(notifications.notify.mock.calls.map((c: any[]) => c[0].type)).toEqual(['order_created', 'payment_succeeded']);
    expect(order.lastPayment).toEqual({ status: 'paid', message: 'Оплачено', transactionId: 'K-1' });
  });

  // ── TC-03 ──
  it('create: rejects an empty cart', async () => {
    cartService.getCart.mockResolvedValue({ items: [] });
    await expect(service.create(CUSTOMER, {})).rejects.toMatchObject({ errorCode: ErrorCode.CART_EMPTY });
  });

  // ── TC-04 ──
  it('create: rejects when stock is insufficient and reserves nothing', async () => {
    inventory.getBulkAvailability.mockResolvedValue(new Map([['p-gloves', { available: 100 }], ['p-helmet', { available: 1 }]]));
    await expect(service.create(CUSTOMER, {})).rejects.toMatchObject({ errorCode: ErrorCode.INSUFFICIENT_STOCK });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  // ── TC-05 ──
  it('create: validates the payment method before touching stock', async () => {
    await expect(service.create(CUSTOMER, { paymentMethod: 'bitcoin' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.PAYMENT_METHOD_UNSUPPORTED });
    expect(inventory.getBulkAvailability).not.toHaveBeenCalled();
  });

  // ── TC-06 ──
  it('create: an invalid promo code aborts checkout with a readable reason', async () => {
    await expect(service.create(CUSTOMER, { promoCode: 'WRONG' })).rejects.toMatchObject({ errorCode: ErrorCode.PROMO_INVALID });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  // ── TC-07 ──
  it('create: a declined payment keeps the order and tells the customer to retry', async () => {
    payments.processOrderPayment.mockResolvedValue({ status: 'failed', message: 'недостаточно средств', transactionId: null });
    const order = await service.create(CUSTOMER, { paymentMethod: 'kaspi' });

    expect(order.lastPayment?.status).toBe('failed');
    expect(notifications.notify.mock.calls.map((c: any[]) => c[0].type)).toEqual(['order_created', 'payment_failed']);
  });

  // ── TC-08 ──
  it('status machine: forbids skipping steps and allows valid transitions', async () => {
    await expect(service.transitionStatus('order-1', ADMIN, 'shipped'))
      .rejects.toMatchObject({ errorCode: ErrorCode.INVALID_TRANSITION });

    prisma.order.findUnique.mockResolvedValue(storedOrder({ status: 'confirmed' }));
    await service.transitionStatus('order-1', ADMIN, 'processing');
    expect(tx.order.update).toHaveBeenCalledWith({ where: { id: 'order-1' }, data: { status: 'processing' } });
    expect(notifications.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'order_status_changed', userId: CUSTOMER }));

    expect(service.getValidTransitions('shipped')).toEqual(['delivered']);
    expect(service.getValidTransitions('delivered')).toEqual([]);
  });

  // ── TC-09 ──
  it('status machine: only staff can change status', async () => {
    await expect(service.transitionStatus('order-1', CUSTOMER, 'confirmed'))
      .rejects.toMatchObject({ errorCode: ErrorCode.INSUFFICIENT_ROLE });
  });

  // ── TC-10 ──
  it('cancel: a customer cannot cancel someone else\'s order', async () => {
    await expect(service.cancel('order-1', OTHER, { reason: 'x' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.INSUFFICIENT_ROLE });
  });

  // ── TC-11 ──
  it('cancel: a customer cannot cancel a shipped order, an admin is bound by the state machine', async () => {
    prisma.order.findUnique.mockResolvedValue(storedOrder({ status: 'shipped' }));
    await expect(service.cancel('order-1', CUSTOMER, { reason: 'x' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.ORDER_CANNOT_CANCEL });
    await expect(service.cancel('order-1', ADMIN, { reason: 'x' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.INVALID_TRANSITION });
  });

  // ── TC-12 ──
  it('cancel: a paid order is refunded and its stock reservation released', async () => {
    prisma.order.findUnique.mockResolvedValue(storedOrder({ status: 'confirmed', paymentStatus: 'paid' }));
    await service.cancel('order-1', CUSTOMER, { reason: 'Передумал' });

    expect(tx.order.update).toHaveBeenCalledWith({ where: { id: 'order-1' }, data: { status: 'cancelled', paymentStatus: 'refunded' } });
    expect(tx.payment.create).toHaveBeenCalledWith({ data: expect.objectContaining({ status: 'refunded' }) });
    expect(inventory.releaseAllReserved).toHaveBeenCalledTimes(2);
  });

  // ── TC-13 ──
  it('pay: retrying payment on another customer\'s order is forbidden', async () => {
    await expect(service.pay('order-1', OTHER, { paymentMethod: 'kaspi' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.INSUFFICIENT_ROLE });
    expect(payments.processOrderPayment).not.toHaveBeenCalled();
  });
});
