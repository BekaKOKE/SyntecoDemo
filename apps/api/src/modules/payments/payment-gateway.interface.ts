/**
 * ADAPTER PATTERN — Target interface.
 *
 * This is the interface the application expects from any payment provider.
 * Third-party SDKs (see ./vendors) expose different, incompatible APIs;
 * adapters in ./adapters translate between them and this interface.
 */

export const PAYMENT_GATEWAYS = Symbol('PAYMENT_GATEWAYS');

export type PaymentMethodCode = 'kaspi' | 'halyk_card' | 'bank_invoice' | 'cash_on_delivery';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  /** Amount in KZT (tenge), e.g. 125000.5 */
  amount: number;
  customer: { email: string; phone?: string | null; fullName: string };
  /** Method-specific fields: phone for Kaspi, card fields for Halyk. */
  details: Record<string, string>;
}

export interface PaymentResult {
  /** paid = money captured; pending = will be paid later (invoice/cash); failed = declined. */
  status: 'paid' | 'pending' | 'failed';
  transactionId: string | null;
  message: string;
}

export interface PaymentGateway {
  readonly method: PaymentMethodCode;
  readonly displayName: string;
  readonly description: string;
  /** Fields the customer must fill in (`details` keys). */
  readonly requiredFields: string[];

  pay(request: PaymentRequest): Promise<PaymentResult>;

  /** Optional early format check; throws AppException(PAYMENT_DETAILS_INVALID). */
  validateDetails?(details: Record<string, string>): void;
}
