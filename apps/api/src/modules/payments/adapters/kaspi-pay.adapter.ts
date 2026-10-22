import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../../common/errors/app-exception';
import { PaymentGateway, PaymentRequest, PaymentResult } from '../payment-gateway.interface';
import { KaspiPayClient } from '../vendors/kaspi-pay.sdk';

export const KASPI_MERCHANT_ID = 'SYNTECO-DEMO-001';

/**
 * ADAPTER — makes KaspiPayClient (adaptee) usable as a PaymentGateway (target).
 * Converts tenge → tiyn, normalises the phone, maps StatusCode/Data → PaymentResult.
 * The vendor class itself is not changed.
 */
@Injectable()
export class KaspiPayAdapter implements PaymentGateway {
  readonly method = 'kaspi' as const;
  readonly displayName = 'Kaspi Pay';
  readonly description = 'Счёт на оплату в приложении Kaspi.kz по номеру телефона';
  readonly requiredFields = ['phone'];

  private readonly client: KaspiPayClient;

  constructor(client?: KaspiPayClient) {
    this.client = client ?? new KaspiPayClient(KASPI_MERCHANT_ID);
  }

  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const phone = KaspiPayAdapter.toKaspiPhone(request.details.phone ?? request.customer.phone ?? '');
    if (!phone) {
      throw new AppException(ErrorCode.PAYMENT_DETAILS_INVALID, 'Укажите номер телефона Kaspi в формате +7 7XX XXX XX XX');
    }

    const response = await this.client.CreateRemotePayment({
      MerchantId: KASPI_MERCHANT_ID,
      Phone: phone,
      Amount: Math.round(request.amount * 100),
      Comment: `Synteco order ${request.orderNumber}`,
      ExternalId: request.orderId,
    });

    if (response.StatusCode === 0 && response.Data?.Status === 'Approved') {
      return {
        status: 'paid',
        transactionId: `KASPI-${response.Data.PaymentId}`,
        message: 'Оплачено через Kaspi Pay',
      };
    }

    const reason = response.Data?.RejectReason === 'InsufficientFunds'
      ? 'недостаточно средств'
      : response.StatusCode === 503
        ? 'сервис Kaspi временно недоступен'
        : response.Message;

    return {
      status: 'failed',
      transactionId: response.Data?.PaymentId ? `KASPI-${response.Data.PaymentId}` : null,
      message: `Kaspi Pay отклонил платёж: ${reason}`,
    };
  }

  /** The phone may be omitted (the profile phone is used), but if given it must be valid. */
  validateDetails(details: Record<string, string>): void {
    if (details.phone && !KaspiPayAdapter.toKaspiPhone(details.phone)) {
      throw new AppException(ErrorCode.PAYMENT_DETAILS_INVALID, 'Номер Kaspi должен быть в формате +7 7XX XXX XX XX');
    }
  }

  /** "+7 (701) 123-45-67" | "87011234567" | "7011234567" → "7011234567" */
  static toKaspiPhone(raw: string): string | null {
    let digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) digits = digits.slice(1);
    return /^7\d{9}$/.test(digits) ? digits : null;
  }
}
