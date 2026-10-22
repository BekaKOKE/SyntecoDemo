import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentStatus, PrismaClient } from '@prisma/client';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PAYMENT_GATEWAYS, PaymentGateway, PaymentResult } from './payment-gateway.interface';

export interface ProcessPaymentInput {
  orderId: string;
  actorId: string;
  method: string;
  details?: Record<string, string>;
}

export interface ProcessPaymentOutput extends PaymentResult {
  paymentId: string;
  method: string;
  /** True when a successful payment auto-confirmed a pending order. */
  orderConfirmed: boolean;
}

/**
 * Charges orders through PaymentGateway implementations. Works only with the
 * target interface — it does not know which vendor SDK is behind an adapter.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly gateways = new Map<string, PaymentGateway>();

  constructor(
    private readonly prisma: PrismaClient,
    @Inject(PAYMENT_GATEWAYS) gateways: PaymentGateway[],
  ) {
    gateways.forEach(g => this.gateways.set(g.method, g));
  }

  listMethods() {
    return [...this.gateways.values()].map(g => ({
      method: g.method,
      displayName: g.displayName,
      description: g.description,
      requiredFields: g.requiredFields,
    }));
  }

  /** Throws PAYMENT_METHOD_UNSUPPORTED for unknown methods. */
  getGateway(method: string): PaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new AppException(
        ErrorCode.PAYMENT_METHOD_UNSUPPORTED,
        `Способ оплаты "${method}" не поддерживается. Доступно: ${[...this.gateways.keys()].join(', ')}`,
      );
    }
    return gateway;
  }

  async processOrderPayment(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    const gateway = this.getGateway(input.method);

    const order = await this.prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) throw new AppException(ErrorCode.ORDER_NOT_FOUND, `Order ${input.orderId} not found`);
    if (order.paymentStatus === 'paid') {
      throw new AppException(ErrorCode.ORDER_ALREADY_PAID, `Заказ ${order.orderNumber} уже оплачен`);
    }
    if (order.status === 'cancelled') {
      throw new AppException(ErrorCode.INVALID_TRANSITION, `Заказ ${order.orderNumber} отменён — оплата невозможна`);
    }

    const customer = await this.prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true, phone: true, firstName: true, lastName: true },
    });

    let result: PaymentResult;
    try {
      result = await gateway.pay({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.total),
        customer: {
          email: customer?.email ?? '',
          phone: customer?.phone ?? null,
          fullName: `${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim(),
        },
        details: input.details ?? {},
      });
    } catch (err) {
      // Validation errors (bad card number, phone) go back to the client as 400.
      if (err instanceof AppException) throw err;
      this.logger.error(`Gateway ${gateway.method} failed for ${order.orderNumber}: ${(err as Error)?.message}`);
      result = { status: 'failed', transactionId: null, message: 'Платёжный сервис недоступен, попробуйте позже' };
    }

    const status: PaymentStatus = result.status;
    const confirm = status === 'paid' && order.status === 'pending';

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          orderId: order.id,
          method: gateway.method,
          status,
          amount: order.total,
          externalId: result.transactionId,
          message: result.message,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: gateway.method,
          paymentStatus: status,
          ...(confirm && { status: 'confirmed' }),
        },
      });
      if (confirm) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: 'pending',
            toStatus: 'confirmed',
            actor: 'system',
            comment: `Автоподтверждение после оплаты: ${result.message}`,
          },
        });
      }
      return created;
    });

    return { ...result, paymentId: payment.id, method: gateway.method, orderConfirmed: confirm };
  }
}
