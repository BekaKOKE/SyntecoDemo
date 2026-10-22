import { ErrorCode } from '../../../common/errors/app-exception';
import { PaymentGateway, PaymentRequest } from '../payment-gateway.interface';
import { KaspiPayAdapter, KASPI_MERCHANT_ID } from './kaspi-pay.adapter';
import { HalykCardAdapter } from './halyk-card.adapter';
import { BankInvoiceGateway, CashOnDeliveryGateway } from '../gateways/offline.gateways';
import { KaspiPayClient } from '../vendors/kaspi-pay.sdk';
import { HalykEpayGateway } from '../vendors/halyk-epay.sdk';

const request = (details: Record<string, string>, amount = 12500.5): PaymentRequest => ({
  orderId: 'order-uuid',
  orderNumber: 'SO-2026-000042',
  amount,
  customer: { email: 'buyer@example.kz', phone: '+77071234567', fullName: 'Иван Покупатель' },
  details,
});

const card = (cardNumber: string, cardExpiry = '12/30') =>
  ({ cardNumber, cardExpiry, cardCvc: '123', cardHolder: 'Ivan Ivanov' });

describe('Adapter pattern — payment gateways', () => {
  describe('KaspiPayAdapter → KaspiPayClient (unmodified vendor SDK)', () => {
    it('translates the call into the vendor format: tiyn, 10-digit phone, PascalCase', async () => {
      const client = new KaspiPayClient(KASPI_MERCHANT_ID);
      const spy = jest.spyOn(client, 'CreateRemotePayment');
      const adapter = new KaspiPayAdapter(client);

      await adapter.pay(request({ phone: '+7 (701) 123-45-67' }));

      expect(spy).toHaveBeenCalledWith({
        MerchantId: KASPI_MERCHANT_ID,
        Phone: '7011234567',
        Amount: 1250050,
        Comment: 'Synteco order SO-2026-000042',
        ExternalId: 'order-uuid',
      });
    });

    it('maps an approved vendor response to status "paid"', async () => {
      const r = await new KaspiPayAdapter().pay(request({ phone: '87011234567' }));
      expect(r.status).toBe('paid');
      expect(r.transactionId).toMatch(/^KASPI-\d+$/);
    });

    it('maps "Rejected / InsufficientFunds" to status "failed" with a readable reason', async () => {
      const r = await new KaspiPayAdapter().pay(request({ phone: '+77015550000' }));
      expect(r).toMatchObject({ status: 'failed' });
      expect(r.message).toContain('недостаточно средств');
    });

    it('maps vendor StatusCode 503 to a failed payment', async () => {
      const r = await new KaspiPayAdapter().pay(request({ phone: '+77015559999' }));
      expect(r.status).toBe('failed');
      expect(r.message).toContain('недоступен');
    });

    it('falls back to the customer profile phone when none is given', async () => {
      const r = await new KaspiPayAdapter().pay(request({}));
      expect(r.status).toBe('paid');
    });

    it('rejects a malformed phone before calling the vendor', () => {
      expect(() => new KaspiPayAdapter().validateDetails({ phone: '12345' }))
        .toThrow(expect.objectContaining({ errorCode: ErrorCode.PAYMENT_DETAILS_INVALID }));
      expect(KaspiPayAdapter.toKaspiPhone('+7 701 123 45 67')).toBe('7011234567');
    });
  });

  describe('HalykCardAdapter → HalykEpayGateway (callback API, unmodified)', () => {
    it('wraps the callback API into a Promise and converts units/currency', async () => {
      const vendor = new HalykEpayGateway('T1');
      const spy = jest.spyOn(vendor, 'authorizeAndCapture');
      const r = await new HalykCardAdapter(vendor).pay(request(card('4400 4300 0000 0007')));

      expect(r.status).toBe('paid');
      expect(r.transactionId).toMatch(/^HALYK-T1/);
      const [vendorCard, amountMinor, currency, orderRef] = spy.mock.calls[0];
      expect(vendorCard).toMatchObject({ pan: '4400430000000007', exp_month: 12, exp_year: 2030, holder: 'IVAN IVANOV' });
      expect(amountMinor).toBe('1250050');
      expect(currency).toBe(398);
      expect(orderRef).toBe('SO-2026-000042');
    });

    it('maps ISO response code 51 to "insufficient funds"', async () => {
      const r = await new HalykCardAdapter().pay(request(card('4000000000000002')));
      expect(r.status).toBe('failed');
      expect(r.message).toContain('недостаточно средств');
    });

    it('maps code 14 (Luhn check failed) to "invalid card number"', async () => {
      const r = await new HalykCardAdapter().pay(request(card('4000000000000001')));
      expect(r.message).toContain('неверный номер карты');
    });

    it('maps code 54 for an expired card', async () => {
      const r = await new HalykCardAdapter().pay(request(card('4400430000000007', '01/21')));
      expect(r.message).toContain('срок действия');
    });

    it('validates card fields and lists every problem', () => {
      expect(() => HalykCardAdapter.toHalykCard({ cardNumber: '123', cardExpiry: '13/99', cardCvc: '1', cardHolder: '' }))
        .toThrow(/номер карты.*срок действия.*CVC.*имя держателя/);
    });

    it('turns a vendor exception into a rejected promise', async () => {
      const vendor = new HalykEpayGateway('T1');
      jest.spyOn(vendor, 'authorizeAndCapture').mockImplementation((_c, _a, _cur, _ref, cb) => cb(new Error('socket hang up')));
      await expect(new HalykCardAdapter(vendor).pay(request(card('4400430000000007')))).rejects.toThrow('socket hang up');
    });
  });

  it('lets the system use every provider through the same PaymentGateway interface', async () => {
    const gateways: PaymentGateway[] = [
      new KaspiPayAdapter(), new HalykCardAdapter(), new BankInvoiceGateway(), new CashOnDeliveryGateway(),
    ];
    const details: Record<string, Record<string, string>> = {
      kaspi: { phone: '+77011234567' },
      halyk_card: card('4400430000000007'),
    };

    const results = await Promise.all(gateways.map(g => g.pay(request(details[g.method] ?? {}))));

    expect(results.map(r => r.status)).toEqual(['paid', 'paid', 'pending', 'pending']);
    expect(gateways.map(g => g.method)).toEqual(['kaspi', 'halyk_card', 'bank_invoice', 'cash_on_delivery']);
  });
});
