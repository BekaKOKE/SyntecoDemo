/* eslint-disable */
/**
 * ─────────────────────────────────────────────────────────────────────
 *  SIMULATED THIRD-PARTY SDK — "Halyk ePay card processing" (fictional)
 *  Treat this file as a vendor library: DO NOT MODIFY it to fit Synteco.
 *  Synteco talks to it only through HalykCardAdapter.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Its API is incompatible with PaymentGateway in a different way:
 *   - Node-style callback instead of a Promise
 *   - snake_case fields, amount as a string in minor units ("12500050")
 *   - ISO-4217 numeric currency code (398 = KZT)
 *   - ISO-8583 style response codes: "00" approved, "51" insufficient funds,
 *     "14" invalid card number, "54" expired card
 *
 * Simulation rules: PAN must pass the Luhn check; PAN ending with "0002"
 * → insufficient funds; expiry in the past → expired card.
 */

export interface HalykCard {
  pan: string;
  exp_month: number;
  exp_year: number;   // 4 digits
  cvc: string;
  holder: string;
}

export interface HalykAuthResponse {
  response_code: '00' | '14' | '51' | '54';
  rrn: string | null;           // retrieval reference number
  approval_code: string | null;
  description: string;
}

export type HalykCallback = (err: Error | null, res?: HalykAuthResponse) => void;

export class HalykEpayGateway {
  constructor(private readonly terminalId: string) {}

  authorizeAndCapture(
    card: HalykCard,
    amount_minor: string,
    currency_code: number,
    order_ref: string,
    callback: HalykCallback,
  ): void {
    setTimeout(() => {
      if (currency_code !== 398) return callback(new Error(`Unsupported currency ${currency_code}`));
      if (!/^\d+$/.test(amount_minor)) return callback(new Error('amount_minor must be digits'));

      const pan = card.pan.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(pan) || !HalykEpayGateway.luhn(pan)) {
        return callback(null, { response_code: '14', rrn: null, approval_code: null, description: 'Invalid card number' });
      }
      const now = new Date();
      const expired = card.exp_year < now.getFullYear()
        || (card.exp_year === now.getFullYear() && card.exp_month < now.getMonth() + 1);
      if (expired) {
        return callback(null, { response_code: '54', rrn: null, approval_code: null, description: 'Expired card' });
      }
      if (pan.endsWith('0002')) {
        return callback(null, { response_code: '51', rrn: null, approval_code: null, description: 'Insufficient funds' });
      }

      const rrn = `${this.terminalId}${Date.now().toString().slice(-8)}`;
      callback(null, {
        response_code: '00',
        rrn,
        approval_code: Math.floor(100000 + Math.random() * 899999).toString(),
        description: `Approved ${order_ref}`,
      });
    }, 50);
  }

  static luhn(pan: string): boolean {
    let sum = 0;
    for (let i = 0; i < pan.length; i++) {
      let d = Number(pan[pan.length - 1 - i]);
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum % 10 === 0;
  }
}
