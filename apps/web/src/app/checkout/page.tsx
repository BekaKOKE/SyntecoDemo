'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { ApiError } from '@/lib/api/client';
import {
  getQuote, createOrder, getPaymentMethods, getOrderServices,
  type Quote, type PaymentMethod, type PaymentMethodCode, type OrderServiceOption, type OrderWithPayment,
} from '@/lib/api/orders';
import { PaymentMethodPicker, DemoPaymentHint, validatePaymentDetails, pickPaymentDetails } from '@/components/molecules/PaymentMethodPicker';
import { formatPrice } from '@/lib/format';
import { Icons } from '@/lib/icons';

const sectionTitle: React.CSSProperties = { fontSize: 14, marginBottom: 12 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)',
  fontSize: 14, fontFamily: 'var(--font-sans)', background: 'var(--color-surface)',
};

const errorCode = (err: unknown) => (err instanceof ApiError ? err.details?.errorCode : undefined);
const errorText = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

const PAYMENT_RESULT_TONE = {
  paid:    { color: 'var(--color-ok)',     bg: 'var(--color-ok-soft)',     title: 'Заказ оформлен и оплачен' },
  pending: { color: 'var(--color-warn)',   bg: 'var(--color-warn-soft)',   title: 'Заказ оформлен, ожидает оплаты' },
  failed:  { color: 'var(--color-accent)', bg: 'var(--color-accent-soft)', title: 'Заказ оформлен, но оплата не прошла' },
} as const;

export default function CheckoutPage() {
  const { cart, refresh: refreshCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [serviceOptions, setServiceOptions] = useState<OrderServiceOption[]>([]);

  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [applying, setApplying] = useState(false);
  const [services, setServices] = useState<string[]>([]);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const [method, setMethod] = useState<PaymentMethodCode>('kaspi');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderWithPayment | null>(null);

  useEffect(() => {
    getPaymentMethods().then(setMethods).catch(() => {});
    getOrderServices().then(setServiceOptions).catch(() => {});
  }, []);

  // Kaspi phone prefilled from profile
  useEffect(() => {
    if (user?.phone) setDetails(d => (d.phone ? d : { ...d, phone: user.phone! }));
  }, [user]);

  const runQuote = useCallback(async (code: string | null, svc: string[]) => {
    setQuoting(true);
    try {
      const q = await getQuote({ promoCode: code ?? undefined, services: svc });
      setQuote(q);
      setQuoteError('');
      return null;
    } catch (err) {
      return err;
    } finally {
      setQuoting(false);
    }
  }, []);

  // Re-quote whenever promo, services or the cart change
  useEffect(() => {
    if (!isAuthenticated || cart.items.length === 0 || result) return;
    runQuote(promoCode, services).then(err => {
      if (!err) return;
      if (errorCode(err) === 'PROMO_INVALID' && promoCode) {
        setPromoError(errorText(err, 'Промокод недействителен'));
        setPromoCode(null);
      } else {
        setQuoteError(errorText(err, 'Не удалось рассчитать стоимость'));
      }
    });
  }, [isAuthenticated, cart.items.length, cart.itemCount, cart.totalAmount, promoCode, services, runQuote, result]);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) { setPromoError('Введите промокод'); return; }
    setApplying(true);
    setPromoError('');
    const err = await runQuote(code, services);
    if (err) setPromoError(errorText(err, 'Промокод недействителен'));
    else { setPromoCode(code); setPromoInput(code); }
    setApplying(false);
  };

  const removePromo = () => {
    setPromoCode(null);
    setPromoInput('');
    setPromoError('');
  };

  const toggleService = (code: string) =>
    setServices(s => (s.includes(code) ? s.filter(c => c !== code) : [...s, code]));

  const submit = async () => {
    const selected = methods.find(m => m.method === method);
    const errs = validatePaymentDetails(method, details);
    setFieldErrors(errs);
    setPaymentError('');
    setError('');
    if (Object.keys(errs).length > 0) { setPaymentError('Проверьте платёжные данные'); return; }

    setSubmitting(true);
    try {
      const order = await createOrder({
        notes: notes.trim() || undefined,
        promoCode: promoCode ?? undefined,
        services,
        paymentMethod: method,
        paymentDetails: pickPaymentDetails(selected, details),
      });
      setResult(order);
      refreshCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      const code = errorCode(err);
      if (code === 'PAYMENT_DETAILS_INVALID') setPaymentError(errorText(err, 'Неверные платёжные данные'));
      else if (code === 'PROMO_INVALID') { setPromoError(errorText(err, 'Промокод недействителен')); setPromoCode(null); }
      else setError(errorText(err, 'Не удалось оформить заказ'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="container-site muted" style={{ padding: '64px 24px', textAlign: 'center' }}>Загрузка…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container-site" style={{ maxWidth: 480, margin: '64px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: 'var(--color-ink-4)' }}><Icons.lock width={40} height={40} /></div>
        <h2>Войдите, чтобы оформить заказ</h2>
        <p className="muted" style={{ marginTop: 12, fontSize: 15, lineHeight: 1.55 }}>
          Заказ, оплата и история доставки привязываются к вашему аккаунту. Корзина сохранится после входа.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Link href="/login?redirect=/checkout" className="btn btn-primary">Войти <Icons.arrow /></Link>
          <Link href="/register" className="btn btn-ghost">Регистрация</Link>
        </div>
      </div>
    );
  }

  if (result) {
    const pay = result.lastPayment;
    const tone = PAYMENT_RESULT_TONE[pay?.status ?? 'pending'];
    return (
      <div className="container-site" style={{ maxWidth: 560, margin: '56px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: tone.color }}>
          {pay?.status === 'failed' ? <Icons.warning width={48} height={48} /> : <Icons.check width={48} height={48} />}
        </div>
        <h2>{tone.title}</h2>
        <div className="card" style={{ marginTop: 20, padding: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span className="muted">Номер заказа</span><span className="mono" style={{ fontWeight: 700 }}>{result.orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 8 }}>
            <span className="muted">Сумма к оплате</span><span className="num" style={{ fontWeight: 700 }}>{formatPrice(result.total)}</span>
          </div>
          {pay && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: tone.bg, color: tone.color, fontSize: 13, lineHeight: 1.5 }}>
              {pay.message}
              {pay.transactionId && <div className="mono" style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>Транзакция: {pay.transactionId}</div>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {pay?.status === 'failed' && (
            <Link href={`/accounts/orders?order=${result.orderNumber}`} className="btn btn-primary">Повторить оплату</Link>
          )}
          <Link href="/accounts/orders" className={pay?.status === 'failed' ? 'btn btn-secondary' : 'btn btn-primary'}>Мои заказы</Link>
          <Link href="/products" className="btn btn-ghost">Продолжить покупки</Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container-site" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: 'var(--color-ink-4)' }}><Icons.cart width={48} height={48} /></div>
        <h2>Корзина пуста</h2>
        <p className="muted" style={{ marginTop: 8 }}>Добавьте товары из каталога, чтобы оформить заказ.</p>
        <Link href="/products" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="container-site" style={{ padding: '32px 24px 72px' }}>
      <Link href="/cart" className="muted" style={{ fontSize: 12 }}>← Корзина</Link>
      <h1 style={{ marginTop: 8 }}>Оформление заказа</h1>
      <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>Проверьте состав, примените промокод и выберите способ оплаты.</p>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--color-warn-soft)', color: 'var(--color-warn)', borderRadius: 'var(--radius-sm)', fontSize: 13, marginTop: 16 }}>
          {error}
        </div>
      )}

      <div className="layout-cart" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          {/* Items */}
          <section>
            <h3 style={sectionTitle}>Товары ({cart.itemCount})</h3>
            {cart.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-hair)', fontSize: 13 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{item.title.length > 80 ? `${item.title.substring(0, 80)}…` : item.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {item.brandName} · <span className="num">{formatPrice(item.unitPrice)} × {item.quantity}</span>
                  </div>
                </div>
                <span className="num" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </section>

          {/* Promo */}
          <section className="hairt" style={{ paddingTop: 20 }}>
            <h3 style={sectionTitle}>Промокод</h3>
            {promoCode ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--color-ok-soft)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                <span style={{ color: 'var(--color-ok)' }}><Icons.check /></span>
                <div style={{ flex: 1 }}>
                  <span className="mono" style={{ fontWeight: 700 }}>{promoCode}</span>
                  {quote?.discountDescription && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{quote.discountDescription}</div>}
                </div>
                <button onClick={removePromo} className="btn btn-ghost btn-sm"><Icons.close /> Убрать</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') applyPromo(); }}
                    className="mono" placeholder="Например, SAFETY10" style={{ ...inputStyle, flex: 1, textTransform: 'uppercase' }} />
                  <button onClick={applyPromo} disabled={applying} className="btn btn-secondary" style={{ height: 'auto' }}>
                    {applying ? '…' : 'Применить'}
                  </button>
                </div>
                {promoError && <div style={{ color: 'var(--color-accent)', fontSize: 12, marginTop: 6 }}>{promoError}</div>}
              </>
            )}
          </section>

          {/* Services */}
          {serviceOptions.length > 0 && (
            <section className="hairt" style={{ paddingTop: 20 }}>
              <h3 style={sectionTitle}>Дополнительные услуги</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                {serviceOptions.map(s => {
                  const on = services.includes(s.code);
                  return (
                    <label key={s.code} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', cursor: 'pointer',
                      border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-hair)'}`, borderRadius: 'var(--radius-md)',
                      background: on ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                    }}>
                      <input type="checkbox" checked={on} onChange={() => toggleService(s.code)} style={{ marginTop: 3, accentColor: 'var(--color-accent)' }} />
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, fontWeight: 600 }}>
                          {s.name}<span className="num" style={{ color: 'var(--color-ink-2)', whiteSpace: 'nowrap' }}>{s.priceHint}</span>
                        </span>
                        <span className="muted" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{s.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* Payment */}
          <section className="hairt" style={{ paddingTop: 20 }}>
            <h3 style={sectionTitle}>Способ оплаты</h3>
            <PaymentMethodPicker
              methods={methods}
              value={method}
              onChange={m => { setMethod(m); setFieldErrors({}); setPaymentError(''); }}
              details={details}
              onDetailsChange={d => { setDetails(d); setFieldErrors({}); }}
              errors={fieldErrors}
            />
            {paymentError && <div style={{ color: 'var(--color-accent)', fontSize: 13, marginTop: 8 }}>{paymentError}</div>}
            <div style={{ marginTop: 12 }}><DemoPaymentHint /></div>
          </section>

          {/* Notes */}
          <section className="hairt" style={{ paddingTop: 20 }}>
            <h3 style={sectionTitle}>Комментарий к заказу</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Номер договора, КНП, адрес и время доставки..." />
          </section>
        </div>

        {/* Summary */}
        <aside style={{ order: 0, background: 'var(--color-surface)', border: '1px solid var(--color-hair)', borderRadius: 'var(--radius-md)', padding: 24, position: 'sticky', top: 100 }}>
          <h3 style={{ marginBottom: 16 }}>Ваш заказ</h3>
          {quote ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, opacity: quoting ? 0.6 : 1, transition: 'opacity .15s' }}>
              {quote.lines.map(l => (
                <div key={l.code} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className={l.code === 'discount' ? undefined : 'muted'} style={l.code === 'discount' ? { color: 'var(--color-ok)' } : undefined}>
                    {l.code === 'discount' ? `Скидка${quote.promoCode ? ` (${quote.promoCode})` : ''}` : l.label}
                  </span>
                  <span className="num" style={{ whiteSpace: 'nowrap', color: l.amount < 0 ? 'var(--color-ok)' : undefined }}>
                    {l.amount < 0 ? `−${formatPrice(-l.amount)}` : formatPrice(l.amount)}
                  </span>
                </div>
              ))}
              <div className="hairt" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4, fontWeight: 700, fontSize: 17 }}>
                <span>Итого</span><span className="num">{formatPrice(quote.total)}</span>
              </div>
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>{quoteError || 'Рассчитываем стоимость…'}</p>
          )}
          {quote && quoteError && <p style={{ color: 'var(--color-accent)', fontSize: 12, marginTop: 8 }}>{quoteError}</p>}

          <button onClick={submit} disabled={submitting || !quote} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}>
            {submitting ? 'Оформляем…' : method === 'kaspi' || method === 'halyk_card' ? `Оплатить ${quote ? formatPrice(quote.total) : ''}` : 'Оформить заказ'}
          </button>
          <p className="muted" style={{ fontSize: 11, lineHeight: 1.55, textAlign: 'center', marginTop: 12 }}>
            Нажимая кнопку, вы соглашаетесь с условиями поставки и обработкой персональных данных.
          </p>
        </aside>
      </div>
    </div>
  );
}
