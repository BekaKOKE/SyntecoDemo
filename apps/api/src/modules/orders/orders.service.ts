import { Injectable, Optional } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient, Prisma, OrderStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import {
  CreateOrderDto, CancelOrderDto, ApproveOrderDto, OrderFilterDto,
  OrderResponseDto, OrderItemResponseDto, QuoteOrderDto, PayOrderDto,
} from './dto/order.dto';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { EventsGateway } from '../../common/events/events.gateway';
import { PromotionsService } from '../promotions/promotions.service';
import { PaymentsService, ProcessPaymentOutput } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildOrderCost } from './order-cost/order-services.catalog';
import { CostLine } from './order-cost/order-cost.component';

/**
 * Valid transitions for the order state machine.
 * Any state can transition to cancelled (except delivered).
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['picking', 'cancelled'],
  picking:    ['packed', 'cancelled'],
  packed:     ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
  returned:   [],
};

const VAT_RATE = 0.12; // 12% KZ VAT
const DEFAULT_PAYMENT_METHOD = 'bank_invoice';
const ADMIN_ROLES = ['super_admin', 'admin', 'manager'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'ожидает подтверждения',
  confirmed: 'подтверждён',
  processing: 'в обработке',
  picking: 'комплектуется',
  packed: 'упакован',
  shipped: 'отгружен',
  delivered: 'доставлен',
  cancelled: 'отменён',
  returned: 'возвращён',
};

type CartSnapshot = Awaited<ReturnType<CartService['getCart']>>;

export interface OrderQuote {
  itemCount: number;
  subtotal: number;
  promoCode: string | null;
  discountStrategy: string | null;
  discountDescription: string | null;
  discount: number;
  services: CostLine[];
  servicesTotal: number;
  vat: number;
  total: number;
  /** Full breakdown: goods, discount, each service, VAT. */
  lines: CostLine[];
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly promotions: PromotionsService,
    private readonly payments: PaymentsService,
    private readonly notifications: NotificationsService,
    @Optional() private readonly events?: EventsGateway,
  ) {}

  // ── Price calculation (Strategy + Decorator) ────────

  /** Preview of the order total for the current cart — used live at checkout. */
  async quote(userId: string, dto: QuoteOrderDto): Promise<OrderQuote> {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new AppException(ErrorCode.CART_EMPTY, 'Cart is empty');
    }
    const { quote } = await this.calculate(cart, dto);
    return quote;
  }

  /**
   * 1) DiscountStrategy picked by promo code computes the discount;
   * 2) BaseOrderCost is wrapped by one decorator per selected service;
   * 3) VAT is added on top of the decorated cost.
   */
  private async calculate(cart: CartSnapshot, dto: QuoteOrderDto) {
    const subtotal = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = await this.promotions.evaluate(
      dto.promoCode,
      cart.items.map(i => ({ productId: i.productId, title: i.title, quantity: i.quantity, unitPrice: i.unitPrice })),
      subtotal,
    );

    const cost = buildOrderCost(subtotal, discount.amount, dto.services ?? [], discount.description ?? undefined);
    const costLines = cost.getLines();
    const services = costLines.filter(l => l.code !== 'goods' && l.code !== 'discount');
    const servicesTotal = services.reduce((sum, l) => sum + l.amount, 0);

    // B-04: VAT is rounded per goods line (matches KZ ЭСФ/1С invoices); the
    // discount and services adjust it as one extra line.
    const goodsVat = cart.items.reduce((sum, i) => sum + Math.round(i.totalPrice * VAT_RATE), 0);
    const vat = goodsVat + Math.round((servicesTotal - discount.amount) * VAT_RATE);
    const total = cost.getCost() + vat;

    const quote: OrderQuote = {
      itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      promoCode: discount.code,
      discountStrategy: discount.strategy,
      discountDescription: discount.description,
      discount: discount.amount,
      services,
      servicesTotal,
      vat,
      total,
      lines: [...costLines, { code: 'vat', label: 'НДС 12%', amount: vat }],
    };
    return { quote, promotionId: discount.promotionId };
  }

  // ── Create Order from Cart ──────────────────────────

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    // 1. Validate cart
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new AppException(ErrorCode.CART_EMPTY, 'Cart is empty');
    }

    // Fail fast on an unknown payment method or malformed payment details,
    // before stock is reserved.
    const paymentMethod = dto.paymentMethod ?? DEFAULT_PAYMENT_METHOD;
    this.payments.getGateway(paymentMethod).validateDetails?.(dto.paymentDetails ?? {});

    // 2. Validate stock for all items via InventoryService
    const productIds = cart.items.map(i => i.productId);
    const availability = await this.inventoryService.getBulkAvailability(productIds);

    const outOfStock: string[] = [];
    for (const item of cart.items) {
      const a = availability.get(item.productId);
      if (!a || a.available < item.quantity) {
        outOfStock.push(`${item.title} (available: ${a?.available ?? 0}, requested: ${item.quantity})`);
      }
    }
    if (outOfStock.length > 0) {
      throw new AppException(ErrorCode.INSUFFICIENT_STOCK, 'Insufficient stock for some items', undefined, {
        items: outOfStock,
      });
    }

    // 3. Generate order number
    const orderNumber = await this.generateOrderNumber();

    // 4. Calculate totals: discount strategy + service decorators + VAT
    const { quote, promotionId } = await this.calculate(cart, dto);

    // 5. Create order in a transaction
    const orderId = uuid();

    await this.prisma.$transaction(async (tx) => {
      // Create the order
      await tx.order.create({
        data: {
          id: orderId,
          orderNumber,
          userId,
          status: 'pending',
          subtotal: quote.subtotal,
          discount: quote.discount,
          vat: quote.vat,
          total: quote.total,
          notes: dto.notes ?? null,
          promoCode: quote.promoCode,
          discountStrategy: quote.discountStrategy,
          services: quote.services as unknown as Prisma.InputJsonValue,
          servicesTotal: quote.servicesTotal,
          paymentMethod,
          paymentStatus: 'pending',
        },
      });

      if (promotionId) await this.promotions.markUsed(promotionId, tx);

      // Create all order items in one round-trip (B-01: was N inserts in a loop).
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          // Snapshot product details so order history survives product changes.
          productTitle: item.title ?? null,
          productSku: item.variantId ?? null,
          productImageUrl: (item as any).imageUrl ?? null,
        })),
      });

      // Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: 'pending', // initial creation
          toStatus: 'pending',
          actor: userId,
          comment: 'Order created',
        },
      });

      // Reserve stock via InventoryService
      for (const item of cart.items) {
        await this.inventoryService.reserveAcrossWarehouses(item.productId, item.quantity, tx);
      }

    });

    // 6. Clear the cart
    await this.cartService.clearCart(userId);

    await this.notifications.notify({
      userId, orderId, type: 'order_created',
      title: `Заказ ${orderNumber} оформлен`,
      body: `Ваш заказ ${orderNumber} на сумму ${quote.total} ₸ принят. ` +
        `Позиций: ${cart.items.length}. Мы сообщим об изменении статуса.`,
    });

    // 7. Charge through the selected payment gateway (adapter)
    const lastPayment = await this.chargeAndNotify(orderId, orderNumber, userId, paymentMethod, dto.paymentDetails, true);

    // 8. Return the full order
    return { ...(await this.findById(orderId, userId)), lastPayment };
  }

  // ── Pay (or retry payment for) an existing order ────

  async pay(identifier: string, userId: string, dto: PayOrderDto): Promise<OrderResponseDto> {
    const order = await this.findOrder(identifier);
    await this.assertOwnerOrAdmin(order.userId, userId);
    this.payments.getGateway(dto.paymentMethod).validateDetails?.(dto.paymentDetails ?? {});

    const lastPayment = await this.chargeAndNotify(order.id, order.orderNumber, order.userId, dto.paymentMethod, dto.paymentDetails);
    return { ...(await this.findById(order.id, userId)), lastPayment };
  }

  private async chargeAndNotify(
    orderId: string,
    orderNumber: string,
    customerId: string,
    method: string,
    details?: Record<string, string>,
    reportErrorsAsFailed = false,
  ) {
    let result: Pick<ProcessPaymentOutput, 'status' | 'message' | 'transactionId'> & { orderConfirmed?: boolean };
    try {
      result = await this.payments.processOrderPayment({ orderId, actorId: customerId, method, details });
    } catch (err) {
      // Right after checkout the order already exists — report a failed
      // attempt instead of a 4xx; the customer can retry from the order page.
      if (!reportErrorsAsFailed || !(err instanceof AppException)) throw err;
      result = { status: 'failed', message: err.message, transactionId: null };
    }

    if (result.status === 'paid') {
      await this.notifications.notify({
        userId: customerId, orderId, type: 'payment_succeeded',
        title: `Оплата заказа ${orderNumber} получена`,
        body: `${result.message}. Транзакция: ${result.transactionId}.` +
          (result.orderConfirmed ? ' Заказ подтверждён автоматически.' : ''),
      });
    } else if (result.status === 'failed') {
      await this.notifications.notify({
        userId: customerId, orderId, type: 'payment_failed',
        title: `Оплата заказа ${orderNumber} не прошла`,
        body: `${result.message}. Повторите оплату в разделе «Мои заказы».`,
      });
    }
    return { status: result.status, message: result.message, transactionId: result.transactionId };
  }

  private async assertOwnerOrAdmin(ownerId: string, userId: string): Promise<boolean> {
    if (ownerId === userId) return false;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      throw new AppException(ErrorCode.INSUFFICIENT_ROLE, 'Access denied');
    }
    return true;
  }

  private async notifyStatusChange(order: { id: string; orderNumber: string; userId: string }, to: OrderStatus, comment?: string) {
    await this.notifications.notify({
      userId: order.userId, orderId: order.id, type: 'order_status_changed',
      title: `Заказ ${order.orderNumber}: ${STATUS_LABELS[to]}`,
      body: `Статус заказа ${order.orderNumber} изменён на «${STATUS_LABELS[to]}».` + (comment ? ` ${comment}` : ''),
    });
  }

  // ── List Orders ─────────────────────────────────────

  async findAll(userId: string, role: string, filter: OrderFilterDto) {
    const { page = 1, limit = 20, status } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // Non-admin users see only their own orders
    const isAdmin = ['super_admin', 'admin', 'manager'].includes(role);
    if (!isAdmin) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          payments: { orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    // B-01: batch-load all products and customers for the whole page in two
    // queries, instead of two queries per order inside enrichOrder.
    const allProductIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];
    const allUserIds = [...new Set(orders.map(o => o.userId).filter(Boolean))] as string[];

    const [products, customers] = await Promise.all([
      allProductIds.length
        ? this.prisma.product.findMany({
            where: { id: { in: allProductIds } },
            include: {
              brand: { select: { name: true } },
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
          })
        : Promise.resolve([]),
      allUserIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: allUserIds } },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          })
        : Promise.resolve([]),
    ]);

    const preload = {
      products: new Map(products.map(p => [p.id, p])),
      customers: new Map(customers.map(c => [c.id, c])),
    };

    return {
      data: await Promise.all(orders.map(o => this.enrichOrder(o, false, preload))),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get Order by ID ─────────────────────────────────

  async findById(orderId: string, userId: string): Promise<OrderResponseDto> {
    // Support lookup by UUID or order number (SO-2026-XXXXXX)
    const isOrderNumber = orderId.startsWith('SO-');
    const order = isOrderNumber
      ? await this.prisma.order.findUnique({
          where: { orderNumber: orderId },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'asc' } },
            payments: { orderBy: { createdAt: 'desc' } },
          },
        })
      : await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'asc' } },
            payments: { orderBy: { createdAt: 'desc' } },
          },
        });

    if (!order) {
      throw new AppException(ErrorCode.ORDER_NOT_FOUND, `Order ${orderId} not found`);
    }

    // Ownership check: users see only their own orders; admins see all
    if (order.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const isAdmin = user && ['super_admin', 'admin', 'manager'].includes(user.role);
      if (!isAdmin) {
        throw new AppException(ErrorCode.INSUFFICIENT_ROLE, 'Access denied');
      }
    }

    return this.enrichOrder(order);
  }

  // ── Cancel Order ─────────────────────────────────────

  async cancel(identifier: string, userId: string, dto: CancelOrderDto): Promise<OrderResponseDto> {
    const order = await this.findOrder(identifier);

    // Customers may cancel only their own orders and only before processing starts.
    const isAdmin = await this.assertOwnerOrAdmin(order.userId, userId);
    if (!isAdmin && !['pending', 'confirmed'].includes(order.status)) {
      throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL,
        `Заказ в статусе «${STATUS_LABELS[order.status]}» можно отменить только через менеджера`);
    }

    this.validateTransition(order.status, 'cancelled');
    const refund = order.paymentStatus === 'paid';

    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status: 'cancelled', ...(refund && { paymentStatus: 'refunded' }) },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'cancelled',
          actor: userId,
          comment: refund ? `${dto.reason} (оплата будет возвращена)` : dto.reason,
        },
      });

      if (refund) {
        await tx.payment.create({
          data: {
            orderId: order.id, method: order.paymentMethod ?? 'unknown', status: 'refunded',
            amount: order.total, message: 'Возврат средств при отмене заказа (симуляция)',
          },
        });
      }

      // Release stock reservations via InventoryService
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of items) {
        await this.inventoryService.releaseAllReserved(item.productId, item.quantity, tx);
      }

      return o;
    });

    await this.notifyStatusChange(order, 'cancelled', refund ? 'Оплата будет возвращена.' : undefined);
    return this.enrichOrder({ ...updated, items: [], statusHistory: [] }, true);
  }

  // ── Approve Order (B2B workflow) ─────────────────────

  async approve(identifier: string, userId: string, dto: ApproveOrderDto): Promise<OrderResponseDto> {
    const order = await this.findOrder(identifier);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['super_admin', 'admin', 'manager'].includes(user.role)) {
      throw new AppException(ErrorCode.INSUFFICIENT_ROLE, 'Only managers and admins can approve orders');
    }

    this.validateTransition(order.status, 'confirmed');

    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status: 'confirmed' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'confirmed',
          actor: userId,
          comment: dto.comment ?? 'Approved',
        },
      });

      return o;
    });

    // Real-time: notify subscribers
    this.events?.emitOrderStatusChanged({
      orderId: order.id, orderNumber: order.orderNumber,
      oldStatus: order.status, newStatus: 'confirmed',
    });
    await this.notifyStatusChange(order, 'confirmed', dto.comment);

    return this.enrichOrder({ ...updated, items: [], statusHistory: [] }, true);
  }

  // ── Generic Status Transition ─────────────────────────

  async transitionStatus(
    identifier: string,
    userId: string,
    targetStatus: OrderStatus,
    comment?: string,
  ): Promise<OrderResponseDto> {
    const order = await this.findOrder(identifier);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['super_admin', 'admin', 'manager'].includes(user.role)) {
      throw new AppException(ErrorCode.INSUFFICIENT_ROLE, 'Only managers and admins can change order status');
    }

    this.validateTransition(order.status, targetStatus);

    // For shipped→delivered, deduct stock
    const updated = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status: targetStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: targetStatus,
          actor: userId,
          comment: comment ?? `Status changed to ${targetStatus}`,
        },
      });

      // Deduct stock when order is shipped
      if (targetStatus === 'shipped') {
        const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
        for (const item of items) {
          await this.inventoryService.releaseAllReserved(item.productId, item.quantity, tx);
          // Deduct from default warehouse (first with stock)
          const stock = await tx.productStock.findFirst({
            where: { productId: item.productId },
            orderBy: { quantity: 'desc' },
          });
          if (stock) {
            await this.inventoryService.deduct(item.productId, stock.warehouseId, item.quantity, tx);
          }
        }
      }

      return o;
    });

    // Real-time: notify subscribers of status change
    this.events?.emitOrderStatusChanged({
      orderId: order.id, orderNumber: order.orderNumber,
      oldStatus: order.status, newStatus: targetStatus,
    });
    await this.notifyStatusChange(order, targetStatus, comment);

    return this.enrichOrder({ ...updated, items: [], statusHistory: [] }, true);
  }

  // ── Get valid next statuses ───────────────────────────

  getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
    return VALID_TRANSITIONS[currentStatus] ?? [];
  }

  // ── Private: Find order by UUID or order number ──────

  private async findOrder(identifier: string) {
    const isOrderNumber = identifier.startsWith('SO-');
    const order = isOrderNumber
      ? await this.prisma.order.findUnique({ where: { orderNumber: identifier } })
      : await this.prisma.order.findUnique({ where: { id: identifier } });

    if (!order) throw new AppException(ErrorCode.ORDER_NOT_FOUND, `Order ${identifier} not found`);
    return order;
  }

  // ── Admin: Find order without ownership check ──────

  async findByIdAdmin(orderId: string): Promise<OrderResponseDto> {
    const isOrderNumber = orderId.startsWith('SO-');
    const order = isOrderNumber
      ? await this.prisma.order.findUnique({
          where: { orderNumber: orderId },
          include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } }, payments: { orderBy: { createdAt: 'desc' } } },
        })
      : await this.prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } }, payments: { orderBy: { createdAt: 'desc' } } },
        });

    if (!order) throw new AppException(ErrorCode.ORDER_NOT_FOUND, `Order ${orderId} not found`);
    return this.enrichOrder(order);
  }

  // ── State Machine Validation ────────────────────────

  private validateTransition(current: OrderStatus, target: OrderStatus): void {
    const allowed = VALID_TRANSITIONS[current];
    if (!allowed || !allowed.includes(target)) {
      throw new AppException(ErrorCode.INVALID_TRANSITION,
        `Cannot transition from "${current}" to "${target}". ` +
        `Allowed transitions: ${allowed?.join(', ') || 'none'}`
      );
    }
  }

  // ── Order Number Generator ──────────────────────────

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SO-${year}-`;

    // Retry loop: handles concurrent order creation by catching unique
    // constraint violations and regenerating with the new latest number.
    for (let attempt = 0; attempt < 5; attempt++) {
      const last = await this.prisma.order.findFirst({
        where: { orderNumber: { startsWith: prefix } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });

      const next = last
        ? parseInt(last.orderNumber.replace(prefix, ''), 10) + 1
        : 1;

      const orderNumber = `${prefix}${String(next).padStart(6, '0')}`;

      // Verify this number isn't already taken (handles race between findFirst and insert)
      const exists = await this.prisma.order.findUnique({
        where: { orderNumber },
        select: { id: true },
      });

      if (!exists) {
        return orderNumber;
      }

      // Collision detected — another request grabbed this number. Retry.
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 10 * (attempt + 1))); // 10ms, 20ms, 30ms, 40ms
      }
    }

    // Fallback: use UUID suffix to guarantee uniqueness
    const { v4: uuid } = await import('uuid');
    return `${prefix}${uuid().slice(0, 6).toUpperCase()}`;
  }

  // ── Response Enrichment ──────────────────────────────

  private async enrichOrder(
    order: any,
    refetch: boolean = false,
    preload?: { products?: Map<string, any>; customers?: Map<string, any> },
  ): Promise<OrderResponseDto> {
    // Re-fetch with relations if needed
    const full = refetch
      ? await this.prisma.order.findUnique({
          where: { id: order.id },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'asc' } },
            payments: { orderBy: { createdAt: 'desc' } },
          },
        })
      : order;

    if (!full) throw new AppException(ErrorCode.ORDER_NOT_FOUND, 'Order not found');

    // Enrich items with product info. Use a preloaded map when the caller
    // (e.g. findAll) already batch-fetched products — avoids per-order N+1.
    const productIds = full.items?.map((i: any) => i.productId) ?? [];
    let productMap: Map<string, any>;
    if (preload?.products) {
      productMap = preload.products;
    } else {
      const products = productIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
              brand: { select: { name: true } },
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
          })
        : [];
      productMap = new Map(products.map(p => [p.id, p]));
    }

    const items: OrderItemResponseDto[] = (full.items ?? []).map((item: any) => {
      const p = productMap.get(item.productId);
      return {
        id: item.id,
        productId: item.productId,
        variantId: p?.variantId ?? item.variantId ?? '',
        title: p?.title ?? 'Unknown',
        brandName: p?.brand?.name ?? '',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        imageUrl: p?.images?.[0]?.url ?? p?.imageUrl ?? null,
      };
    });

    // Fetch customer info (use preloaded map when available — avoids N+1).
    const customer = full.userId
      ? (preload?.customers
          ? preload.customers.get(full.userId) ?? null
          : await this.prisma.user.findUnique({
              where: { id: full.userId },
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            }))
      : null;

    return {
      id: full.id,
      orderNumber: full.orderNumber,
      status: full.status as any,
      subtotal: Number(full.subtotal),
      discount: Number(full.discount ?? 0),
      vat: Number(full.vat ?? 0),
      total: Number(full.total),
      promoCode: full.promoCode ?? null,
      discountStrategy: full.discountStrategy ?? null,
      services: Array.isArray(full.services) ? full.services : [],
      servicesTotal: Number(full.servicesTotal ?? 0),
      paymentMethod: full.paymentMethod ?? null,
      paymentStatus: full.paymentStatus ?? 'pending',
      payments: (full.payments ?? []).map((p: any) => ({
        id: p.id,
        method: p.method,
        status: p.status,
        amount: Number(p.amount),
        externalId: p.externalId,
        message: p.message,
        createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
      })),
      notes: full.notes,
      customer: customer ? {
        userId: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone ?? null,
      } : null,
      items,
      statusHistory: (full.statusHistory ?? []).map((h: any) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        actor: h.actor,
        comment: h.comment,
        createdAt: h.createdAt?.toISOString?.() ?? h.createdAt,
      })),
      createdAt: full.createdAt?.toISOString?.() ?? full.createdAt,
      updatedAt: full.updatedAt?.toISOString?.() ?? full.updatedAt,
    };
  }
}
