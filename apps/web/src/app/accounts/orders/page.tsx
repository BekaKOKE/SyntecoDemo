'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Icons } from '@/lib/icons';
import { formatPrice, formatDateTime } from '@/lib/format';
import {
  getOrders, getOrder, payOrder, cancelOrder, getPaymentMethods,
  ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS,
  type Order, type PaymentMethod, type PaymentMethodCode, type PaymentResult, type PaymentStatus,
} from '@/lib/api/orders';
import { PaymentMethodPicker, DemoPaymentHint, validatePaymentDetails, pickPaymentDetails } from '@/components/molecules/PaymentMethodPicker';

const RED: React.CSSProperties = { background: 'var(--color-accent-soft)', color: 'var(--color-accent)', borderColor: 'color-mix(in oklch, var(--color-accent) 25%, transparent)' };
const INFO: React.CSSProperties = { background: 'var(--color-info-soft)', color: 'var(--color-info)', borderColor: 'color-mix(in oklch, var(--color-info) 25%, transparent)' };

function StatusPill({ status }: { status: string }) {
  const cls = status === 'shipped' || status === 'delivered' ? 'pill ok' : status === 'pending' ? 'pill warn' : 'pill';
  const style = status === 'cancelled' || status === 'returned' ? RED : cls === 'pill' ? INFO : undefined;
  return <span className={cls} style={{ ...style, fontSize: 11 }}><span className="dot" style={style ? { background: 'currentColor' } : undefined} />{ORDER_STATUS_LABELS[status] ?? status}</span>;
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  const cls = status === 'paid' ? 'pill ok' : status === 'pending' ? 'pill warn' : 'pill';
  const style = status === 'failed' ? RED : status === 'refunded' ? INFO : undefined;
  return <span className={cls} style={{ ...style, fontSize: 11 }}><span className="dot" style={style ? { background: 'currentColor' } : undefined} />{PAYMENT_STATUS_LABELS[status] ?? status}</span>;
}

const canPay = (o: Order) => (o.paymentStatus === 'pending' || o.paymentStatus === 'failed') && o.status !== 'cancelled' && o.status !== 'returned';
const canCancel = (o: Order) => o.status === 'pending' || o.status === 'confirmed';

function PayForm({ order, methods, onDone }: { order: Order; methods: PaymentMethod[]; onDone: (o: Order, r?: PaymentResult) => void }) {
  const { user } = useAuth();
  const [method, setMethod] = useState<PaymentMethodCode>(
    order.paymentMethod === 'kaspi' || order.paymentMethod === 'halyk_card' ? order.paymentMethod : 'kaspi',
  );
  const [details, setDetails] = useState<Record<string, string>>({ phone: user?.phone ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const errs = validatePaymentDetails(method, details);
    setErrors(errs);
    setError('');
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await payOrder(order.id, method, pickPaymentDetails(methods.find(m => m.method === method), details));
      onDone(res, res.lastPayment);
    } catch (err: any) {
      setError(err?.message ?? 'Не удалось провести оплату');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Оплата заказа {order.orderNumber} · <span className="num">{formatPrice(order.total)}</span></div>
      <PaymentMethodPicker
        name={`pay-${order.id}`}
        methods={methods}
        value={method}
        onChange={m => { setMethod(m); setErrors({}); }}
        details={details}
        onDetailsChange={d => { setDetails(d); setErrors({}); }}
        errors={errors}
      />
      {error && <div style={{ color: 'var(--color-accent)', fontSize: 13 }}>{error}</div>}
      <DemoPaymentHint />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={submit} disabled={loading} className="btn btn-primary">{loading ? 'Обработка…' : `Оплатить ${formatPrice(order.total)}`}</button>
      </div>
    </div>
  );
}

function CancelForm({ order, onDone, onClose }: { order: Order; onDone: (o: Order) => void; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) { setError('Укажите причину отмены'); return; }
    setLoading(true);
    setError('');
    try {
      onDone(await cancelOrder(order.id, reason.trim()));
    } catch (err: any) {
      setError(err?.message ?? 'Не удалось отменить заказ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Отмена заказа {order.orderNumber}</div>
      {order.paymentStatus === 'paid' && (
        <div className="muted" style={{ fontSize: 12 }}>Заказ оплачен — средства вернутся тем же способом оплаты.</div>
      )}
      <textarea value={reason} onChange={e => { setReason(e.target.value); setError(''); }} rows={2} placeholder="Причина отмены"
        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'var(--font-sans)', resize: 'vertical', background: 'var(--color-surface)' }} />
      {error && <div style={{ color: 'var(--color-accent)', fontSize: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} className="btn btn-ghost">Не отменять</button>
        <button onClick={submit} disabled={loading} className="btn btn-secondary" style={{ color: 'var(--color-accent)' }}>{loading ? '…' : 'Отменить заказ'}</button>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: React.ReactNode; value: string; tone?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span className={tone ? undefined : 'muted'} style={tone ? { color: tone } : undefined}>{label}</span>
      <span className="num" style={{ color: tone, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

function OrderCard({ order, methods, initiallyOpen, initialAction, onUpdate }: {
  order: Order;
  methods: PaymentMethod[];
  initiallyOpen: boolean;
  initialAction: 'pay' | null;
  onUpdate: (o: Order) => void;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [detail, setDetail] = useState<Order | null>(null);
  const [action, setAction] = useState<'pay' | 'cancel' | null>(initialAction);
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);
  const o = detail ?? order;

  // The list endpoint omits payment history — load the full order on expand
  useEffect(() => {
    if (open && !detail) getOrder(order.id).then(setDetail).catch(() => {});
  }, [open, detail, order.id]);

  const apply = (next: Order, payment?: PaymentResult) => {
    setAction(null);
    if (payment) setLastPayment(payment);
    getOrder(next.id).then(full => { setDetail(full); onUpdate(full); }).catch(() => { setDetail(next); onUpdate(next); });
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left', flexWrap: 'wrap', font: 'inherit', color: 'inherit' }}>
        <div style={{ minWidth: 150 }}>
          <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{o.orderNumber}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString('ru-RU')} · {o.items.length} поз.</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <StatusPill status={o.status} />
          <PaymentPill status={o.paymentStatus} />
          {o.promoCode && <span className="pill mono" style={{ fontSize: 10 }}>{o.promoCode}</span>}
        </div>
        <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>{formatPrice(o.total)}</div>
        <span style={{ color: 'var(--color-ink-4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><Icons.chevD /></span>
      </button>

      {open && (
        <div className="hairt" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {lastPayment && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13,
              background: lastPayment.status === 'paid' ? 'var(--color-ok-soft)' : lastPayment.status === 'failed' ? 'var(--color-accent-soft)' : 'var(--color-warn-soft)',
              color: lastPayment.status === 'paid' ? 'var(--color-ok)' : lastPayment.status === 'failed' ? 'var(--color-accent)' : 'var(--color-warn)',
            }}>
              {lastPayment.message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
            {/* Items */}
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Состав заказа</div>
              {o.items.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-hair)', fontSize: 13 }}>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/products/${it.productId}`} style={{ fontWeight: 500 }}>{it.title}</Link>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{it.brandName} · <span className="num">{formatPrice(it.unitPrice)} × {it.quantity}</span></div>
                  </div>
                  <span className="num" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatPrice(it.totalPrice)}</span>
                </div>
              ))}
              {o.notes && <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Комментарий: {o.notes}</p>}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>Сумма</div>
              <Row label="Товары" value={formatPrice(o.subtotal)} />
              {Number(o.discount) > 0 && (
                <Row label={<>Скидка {o.promoCode && <span className="mono">({o.promoCode})</span>}</>} value={`−${formatPrice(o.discount)}`} tone="var(--color-ok)" />
              )}
              {o.services?.map(s => <Row key={s.code} label={s.label} value={formatPrice(s.amount)} />)}
              <Row label="НДС 12%" value={formatPrice(o.vat)} />
              <div className="hairt" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 2, fontWeight: 700, fontSize: 15 }}>
                <span>Итого</span><span className="num">{formatPrice(o.total)}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Оплата: {o.paymentMethod ? PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod : '—'}
              </div>
            </div>
          </div>

          {/* Actions */}
          {(canPay(o) || canCancel(o)) && !action && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {canPay(o) && (
                <button onClick={() => setAction('pay')} className="btn btn-primary">
                  <Icons.money /> {o.paymentStatus === 'failed' ? 'Повторить оплату' : 'Оплатить'}
                </button>
              )}
              {canCancel(o) && <button onClick={() => setAction('cancel')} className="btn btn-ghost" style={{ color: 'var(--color-accent)' }}>Отменить</button>}
            </div>
          )}
          {action === 'pay' && canPay(o) && <PayForm order={o} methods={methods} onDone={apply} />}
          {action === 'cancel' && <CancelForm order={o} onDone={next => apply(next)} onClose={() => setAction(null)} />}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {/* Status history */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>История статусов</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...(o.statusHistory ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((h, i) => (
                  <div key={h.id ?? i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, marginTop: 4, flexShrink: 0, background: i === 0 ? 'var(--color-accent)' : 'var(--color-ink-5)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{ORDER_STATUS_LABELS[h.toStatus] ?? h.toStatus}</div>
                      {h.comment && <div className="muted">{h.comment}</div>}
                      <div className="muted" style={{ fontSize: 11 }}>{formatDateTime(h.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments history */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Платежи</div>
              {!detail ? (
                <div className="muted" style={{ fontSize: 12 }}>Загрузка…</div>
              ) : o.payments.length === 0 ? (
                <div className="muted" style={{ fontSize: 12 }}>Платежей пока не было</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {o.payments.map(p => (
                    <div key={p.id} style={{ fontSize: 12, padding: '8px 10px', border: '1px solid var(--color-hair)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
                        <PaymentPill status={p.status} />
                      </div>
                      {p.message && <div className="muted" style={{ marginTop: 4 }}>{p.message}</div>}
                      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                        <span className="num">{formatPrice(p.amount)}</span> · {formatDateTime(p.createdAt)}{p.externalId ? <> · <span className="mono">{p.externalId}</span></> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountOrders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    setFocus(new URLSearchParams(window.location.search).get('order'));
    getPaymentMethods().then(setMethods).catch(() => {});
  }, []);

  const load = useCallback(() => {
    getOrders(1, 50).then(d => setOrders(d.data || [])).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const updateOrder = (next: Order) => setOrders(list => list.map(o => (o.id === next.id ? next : o)));

  if (authLoading) {
    return <div className="container-site muted" style={{ padding: '64px 24px', textAlign: 'center' }}>Загрузка…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container-site" style={{ padding: '56px 24px 72px' }}>
        <div
          className="card order-login-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 280px',
            gap: 24,
            alignItems: 'center',
            padding: 32,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, #fff 0%, #fafafa 62%, var(--color-accent-soft) 100%)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: 'var(--color-accent)' }}>Статус заказа</div>
            <h1 style={{ marginTop: 10, fontSize: 34, lineHeight: 1.08, letterSpacing: 0 }}>
              Войдите, чтобы посмотреть историю заказов
            </h1>
            <p style={{ maxWidth: 620, marginTop: 12, color: 'var(--color-ink-3)', fontSize: 15, lineHeight: 1.6 }}>
              В личном кабинете доступны статусы, состав заказа и документы. Если заказ оформлял менеджер Synteco,
              можно также уточнить статус через контакты.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
              <Link href="/login?redirect=/accounts/orders" className="btn btn-primary btn-lg">
                Войти <Icons.arrow />
              </Link>
              <Link href="/contacts" className="btn btn-secondary btn-lg">
                Связаться с менеджером
              </Link>
              <Link href="/products" className="btn btn-ghost btn-lg">
                Открыть каталог
              </Link>
            </div>
          </div>
          <div className="hide-mobile" style={{ border: '1px solid var(--color-hair)', borderRadius: 8, background: '#fff', padding: 18 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['01', 'Авторизация'],
                ['02', 'История заказов'],
                ['03', 'Документы и КП'],
              ].map(([num, label]) => (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono" style={{ color: 'var(--color-accent)', fontWeight: 800 }}>{num}</span>
                  <span style={{ color: 'var(--color-ink-2)', fontWeight: 650 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site" style={{ padding: '40px 24px 72px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <Link href="/accounts/dashboard" className="muted" style={{ fontSize: 12 }}>← Личный кабинет</Link>
          <h1 style={{ fontSize: 30, fontWeight: 760, marginTop: 8, letterSpacing: 0 }}>Мои заказы</h1>
          <p className="muted" style={{ marginTop: 6 }}>История заказов, статусы оплаты и состав поставок.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Link href="/accounts/notifications" className="btn btn-ghost"><Icons.bell /> Уведомления</Link>
          <Link href="/contacts" className="btn btn-secondary">Связаться с менеджером</Link>
        </div>
      </div>

      {!loaded ? (
        <div className="card muted" style={{ padding: 40, textAlign: 'center' }}>Загрузка заказов…</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, color: 'var(--color-accent)' }}><Icons.package width={40} height={40} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Заказов пока нет</h3>
          <p className="muted" style={{ margin: '8px auto 0', maxWidth: 460, fontSize: 14 }}>
            Начните с каталога или отправьте запрос коммерческого предложения менеджеру Synteco.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <Link href="/products" className="btn btn-primary btn-lg">Перейти в каталог</Link>
            <Link href="/contacts" className="btn btn-secondary btn-lg">Запросить КП</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const focused = focus != null && (focus === order.orderNumber || focus === order.id);
            return (
              <OrderCard
                key={order.id}
                order={order}
                methods={methods}
                initiallyOpen={focused}
                initialAction={focused && canPay(order) ? 'pay' : null}
                onUpdate={updateOrder}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
