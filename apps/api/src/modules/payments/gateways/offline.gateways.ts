import { Injectable } from '@nestjs/common';
import { PaymentGateway, PaymentRequest, PaymentResult } from '../payment-gateway.interface';

/**
 * Native gateways — they implement PaymentGateway directly, so no adapter is
 * needed. Both leave the payment "pending": money arrives later.
 */

@Injectable()
export class BankInvoiceGateway implements PaymentGateway {
  readonly method = 'bank_invoice' as const;
  readonly displayName = 'Счёт на оплату для юрлиц';
  readonly description = 'Безналичный расчёт по счёту, оплата в течение 5 банковских дней';
  readonly requiredFields: string[] = [];

  async pay(request: PaymentRequest): Promise<PaymentResult> {
    return {
      status: 'pending',
      transactionId: `INV-${request.orderNumber}`,
      message: `Счёт INV-${request.orderNumber} выставлен на ${request.customer.email}`,
    };
  }
}

@Injectable()
export class CashOnDeliveryGateway implements PaymentGateway {
  readonly method = 'cash_on_delivery' as const;
  readonly displayName = 'Оплата при получении';
  readonly description = 'Наличными или картой курьеру / на складе самовывоза';
  readonly requiredFields: string[] = [];

  async pay(): Promise<PaymentResult> {
    return { status: 'pending', transactionId: null, message: 'Оплата при получении заказа' };
  }
}
