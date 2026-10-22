/* eslint-disable */
/**
 * ─────────────────────────────────────────────────────────────────────
 *  SIMULATED THIRD-PARTY SDK — "Kaspi Pay Merchant API v2" (fictional)
 *  Treat this file as a vendor library: DO NOT MODIFY it to fit Synteco.
 *  Synteco talks to it only through KaspiPayAdapter.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Its API is deliberately incompatible with PaymentGateway:
 *   - PascalCase request/response fields
 *   - amount is an integer in tiyn (1 KZT = 100 tiyn)
 *   - phone must be 10 digits without +7 / 8 prefix
 *   - result is a numeric StatusCode + nested Data, not a status string
 *
 * Simulation rules: phone ending with "0000" → rejected (insufficient funds),
 * phone ending with "9999" → service unavailable; otherwise approved.
 */

export interface KaspiRemotePaymentRequest {
  MerchantId: string;
  Phone: string;          // "7011234567"
  Amount: number;         // tiyn, integer
  Comment: string;
  ExternalId: string;
}

export interface KaspiRemotePaymentResponse {
  StatusCode: 0 | 1 | 503;          // 0 = OK, 1 = business error, 503 = unavailable
  Message: string;
  Data?: {
    PaymentId: number;
    Status: 'Approved' | 'Rejected';
    RejectReason?: 'InsufficientFunds' | 'ClientNotFound';
  };
}

export class KaspiPayClient {
  private static nextPaymentId = 900000;

  constructor(private readonly merchantId: string) {}

  async CreateRemotePayment(req: KaspiRemotePaymentRequest): Promise<KaspiRemotePaymentResponse> {
    await new Promise(r => setTimeout(r, 50)); // network latency

    if (req.MerchantId !== this.merchantId) {
      return { StatusCode: 1, Message: 'Merchant mismatch' };
    }
    if (!/^7\d{9}$/.test(req.Phone)) {
      return {
        StatusCode: 1,
        Message: 'Client not found',
        Data: { PaymentId: 0, Status: 'Rejected', RejectReason: 'ClientNotFound' },
      };
    }
    if (!Number.isInteger(req.Amount) || req.Amount <= 0) {
      return { StatusCode: 1, Message: 'Invalid amount' };
    }
    if (req.Phone.endsWith('9999')) {
      return { StatusCode: 503, Message: 'Kaspi service temporarily unavailable' };
    }

    const PaymentId = KaspiPayClient.nextPaymentId++;
    if (req.Phone.endsWith('0000')) {
      return {
        StatusCode: 0,
        Message: 'Payment rejected by client bank',
        Data: { PaymentId, Status: 'Rejected', RejectReason: 'InsufficientFunds' },
      };
    }
    return { StatusCode: 0, Message: 'Success', Data: { PaymentId, Status: 'Approved' } };
  }
}
