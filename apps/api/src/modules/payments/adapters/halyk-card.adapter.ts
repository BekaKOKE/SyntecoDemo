import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../../common/errors/app-exception';
import { PaymentGateway, PaymentRequest, PaymentResult } from '../payment-gateway.interface';
import { HalykAuthResponse, HalykCard, HalykEpayGateway } from '../vendors/halyk-epay.sdk';

const KZT_ISO_CODE = 398;
export const HALYK_TERMINAL_ID = '88021';

const RESPONSE_MESSAGES: Record<HalykAuthResponse['response_code'], string> = {
  '00': 'Оплачено банковской картой',
  '14': 'неверный номер карты',
  '51': 'недостаточно средств на карте',
  '54': 'срок действия карты истёк',
};

/**
 * ADAPTER — makes HalykEpayGateway (callback-based, minor units, ISO codes)
 * usable as a Promise-based PaymentGateway. The vendor class is not changed.
 */
@Injectable()
export class HalykCardAdapter implements PaymentGateway {
  readonly method = 'halyk_card' as const;
  readonly displayName = 'Банковская карта (Halyk ePay)';
  readonly description = 'Visa / Mastercard, списание сразу при оформлении';
  readonly requiredFields = ['cardNumber', 'cardExpiry', 'cardCvc', 'cardHolder'];

  private readonly gateway: HalykEpayGateway;

  constructor(gateway?: HalykEpayGateway) {
    this.gateway = gateway ?? new HalykEpayGateway(HALYK_TERMINAL_ID);
  }

  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const card = HalykCardAdapter.toHalykCard(request.details);
    const amountMinor = Math.round(request.amount * 100).toString();

    // Promisify the vendor's callback API.
    const response = await new Promise<HalykAuthResponse>((resolve, reject) => {
      this.gateway.authorizeAndCapture(card, amountMinor, KZT_ISO_CODE, request.orderNumber, (err, res) => {
        if (err || !res) reject(err ?? new Error('Empty response from Halyk ePay'));
        else resolve(res);
      });
    });

    if (response.response_code === '00') {
      return {
        status: 'paid',
        transactionId: `HALYK-${response.rrn}`,
        message: `${RESPONSE_MESSAGES['00']} (код авторизации ${response.approval_code})`,
      };
    }
    return {
      status: 'failed',
      transactionId: null,
      message: `Банк отклонил платёж: ${RESPONSE_MESSAGES[response.response_code]}`,
    };
  }

  validateDetails(details: Record<string, string>): void {
    HalykCardAdapter.toHalykCard(details);
  }

  /** Validates our flat `details` and maps them to the vendor's card structure. */
  static toHalykCard(details: Record<string, string>): HalykCard {
    const pan = (details.cardNumber ?? '').replace(/\s+/g, '');
    const expiry = (details.cardExpiry ?? '').match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
    const cvc = details.cardCvc ?? '';
    const holder = (details.cardHolder ?? '').trim();

    const errors: string[] = [];
    if (!/^\d{16}$/.test(pan)) errors.push('номер карты — 16 цифр');
    if (!expiry || Number(expiry[1]) < 1 || Number(expiry[1]) > 12) errors.push('срок действия в формате ММ/ГГ');
    if (!/^\d{3}$/.test(cvc)) errors.push('CVC — 3 цифры');
    if (holder.length < 2) errors.push('имя держателя карты');
    if (errors.length) {
      throw new AppException(ErrorCode.PAYMENT_DETAILS_INVALID, `Проверьте данные карты: ${errors.join(', ')}`);
    }

    const [, month = '', yearPart = ''] = expiry as RegExpMatchArray;
    const year = yearPart.length === 2 ? 2000 + Number(yearPart) : Number(yearPart);
    return { pan, exp_month: Number(month), exp_year: year, cvc, holder: holder.toUpperCase() };
  }
}
