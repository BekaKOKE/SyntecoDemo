'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AI } from '@/lib/icons';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/context/auth-context';
import { isManagerRole } from '@/lib/roles';
import {
  getOrders,
  getOrder,
  approveOrder,
  cancelOrder,
  transitionOrder,
  getOrderTransitions,
  type OrderDTO,
} from '@/lib/api/admin';
import { fmtTng } from '@/lib/formatters';

// ── Status map ─────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; pill: string; step: number } | undefined> = {
  pending:     { label: 'Ожидает',      pill: 'pill-info',    step: 0 },
  confirmed:   { label: 'Подтверждён',  pill: 'pill-info',    step: 1 },
  processing:  { label: 'Собирается',   pill: 'pill-warn',    step: 2 },
  picking:     { label: 'Комплектация', pill: 'pill-warn',    step: 3 },
  packed:      { label: 'Упакован',     pill: 'pill-purple',  step: 4 },
  shipped:     { label: 'Отправлен',    pill: 'pill-ok',      step: 5 },
  delivered:   { label: 'Доставлен',    pill: 'pill-ok',      step: 6 },
  cancelled:   { label: 'Отменён',      pill: '',             step: -1 },
  returned:    { label: 'Возврат',      pill: 'pill-red',     step: -2 },
};

const PAYMENT_STATUS: Record<string, { label: string; pill: string }> = {
  pending:  { label: 'Ожидает оплаты', pill: 'pill-warn' },
  paid:     { label: 'Оплачен',        pill: 'pill-ok' },
  failed:   { label: 'Не прошла',      pill: 'pill-red' },
  refunded: { label: 'Возврат',        pill: 'pill-info' },
};

const PAYMENT_METHODS: Record<string, string> = {
  kaspi: 'Kaspi Pay',
  halyk_card: 'Карта Halyk',
  bank_invoice: 'Счёт юрлицу',
  cash_on_delivery: 'При получении',
};

function PaymentPill({ status }: { status?: string }) {
  if (!status) return null;
  const ps = PAYMENT_STATUS[status] ?? { label: status, pill: '' };
  return <span className={`pill ${ps.pill}`}><span className="dot"/>{ps.label}</span>;
}

const STATUS_TABS = [
  { id: '',         label: 'Все' },
  { id: 'pending',  label: 'Ожидают' },
  { id: 'confirmed',label: 'Подтверждены' },
  { id: 'processing', label: 'В сборке' },
  { id: 'shipped',  label: 'Отправлены' },
  { id: 'delivered',label: 'Доставлены' },
  { id: 'cancelled',label: 'Отменены' },
];

// ── Relative time ──────────────────────────────────────────────────

function relTime(ts: string): string {
  const d = new Date(ts), now = new Date();
  const dm = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (dm < 1) return 'только что';
  if (dm < 60) return `${dm} мин`;
  const dh = Math.floor(dm / 60);
  if (dh < 24) return `${dh} ч назад`;
  const dd = Math.floor(dh / 24);
  if (dd < 7) return `${dd} дн назад`;
  return d.toLocaleDateString('ru-RU');
}

// ── Order detail modal ─────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onAction, managerView }: {
  order: OrderDTO;
  onClose: () => void;
  onAction: () => void;
  managerView?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const st = STATUS_MAP[order.status] ?? { label: order.status, pill: '', step: 0 };

  useEffect(() => {
    getOrderTransitions(order.id).then(t => setAllowedTransitions(t.allowed)).catch(() => {});
  }, [order.id]);

  const handleTransition = async (targetStatus: string) => {
    setLoading(targetStatus);
    try {
      await transitionOrder(order.id, targetStatus);
      onAction();
    } catch { /* error surfaced via toast */ }
    setLoading(null);
  };

  const handleApprove = async () => {
    setLoading('confirmed');
    try { await approveOrder(order.id); onAction(); } catch { /* error surfaced via toast */ }
    setLoading(null);
  };

  const handleCancel = async () => {
    setLoading('cancelled');
    try { await cancelOrder(order.id); onAction(); } catch { /* error surfaced via toast */ }
    setLoading(null);
  };

  const canApprove = order.status === 'pending';
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.4)',
      zIndex: 99999, backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть карточку заказа"
        style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }}
      />
      <div style={{
        position: 'relative',
        width: 680, maxHeight: 'calc(100vh - 48px)',
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-3)', overflow: 'hidden',
      }}>
        <div style={{ padding: '30px 30px 16px', overflow: 'auto', flex: '1 1 auto' }}>
        {/* Header */}
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div id="order-detail-title" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
              Заказ {order.orderNumber}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {new Date(order.createdAt).toLocaleString('ru-RU')}
            </div>
          </div>
          <span className={`pill ${st.pill}`}><span className="dot"/>{st.label}</span>
        </div>

        {/* Customer info */}
        {order.customer && (
          <div className="card" style={{ marginTop: 18, padding: 16, background: 'var(--surface-2)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Заказчик</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {order.customer.firstName} {order.customer.lastName}
            </div>
            <div className="row-gap" style={{ gap: 16, marginTop: 6, fontSize: 12, color: 'var(--ink-2)' }}>
              {order.customer.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  {order.customer.email}
                </span>
              )}
              {order.customer.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {order.customer.phone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: 20, display: 'flex', gap: 4 }}>
          {['pending','confirmed','processing','picking','packed','shipped','delivered'].map((s,i) => {
            const done = st.step >= i && st.step >= 0;
            return (
              <div key={s} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: done ? 'var(--ok)' : 'var(--hair)',
                transition: 'background 0.3s',
              }} title={STATUS_MAP[s]?.label} />
            );
          })}
        </div>

        {/* Items */}
        <div className="hairt" style={{ marginTop: 22, paddingTop: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Позиции ({order.items.length})</div>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Бренд</th>
                <th style={{ textAlign: 'right' }}>Цена</th>
                <th style={{ textAlign: 'center' }}>Кол-во</th>
                <th style={{ textAlign: 'right' }}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td>
                    {managerView ? (
                      <span
                        style={{ fontSize: 12, fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                        title={it.title}
                      >
                        {it.title}
                      </span>
                    ) : (
                      <Link href={`/products/${it.productId}/edit`}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 12, fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', color: 'var(--info)', textDecoration: 'none' }}
                        title={it.title}>
                        {it.title}
                      </Link>
                    )}
                    <div className="mono muted" style={{ fontSize: 10 }}>{it.variantId}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{it.brandName}</td>
                  <td className="num" style={{ fontSize: 12, fontWeight: 600 }}>{fmtTng(it.unitPrice)} ₸</td>
                  <td className="num" style={{ textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmtTng(it.totalPrice)} ₸</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ marginTop: 14, textAlign: 'right', fontSize: 13, lineHeight: 1.8 }}>
          <div>Сумма: <b>{fmtTng(Number(order.subtotal))} ₸</b></div>
          {Number(order.discount) > 0 && (
            <div>
              Скидка{order.promoCode && <> по <span className="mono" style={{ fontWeight: 700 }}>{order.promoCode}</span></>}: <b style={{ color: 'var(--ok)' }}>-{fmtTng(Number(order.discount))} ₸</b>
            </div>
          )}
          {order.services?.map(s => (
            <div key={s.code}>{s.label}: <b>{fmtTng(Number(s.amount))} ₸</b></div>
          ))}
          <div>НДС: <b>{fmtTng(Number(order.vat))} ₸</b></div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>Итого: {fmtTng(Number(order.total))} ₸</div>
        </div>

        {/* Payment */}
        <div className="hairt" style={{ marginTop: 20, paddingTop: 16 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              Оплата · <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{order.paymentMethod ? PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod : '—'}</span>
            </div>
            <PaymentPill status={order.paymentStatus} />
          </div>
          {order.payments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {order.payments.map(p => (
                <div key={p.id} className="row-gap" style={{ gap: 10, fontSize: 12 }}>
                  <PaymentPill status={p.status} />
                  <span style={{ fontWeight: 600 }}>{PAYMENT_METHODS[p.method] ?? p.method}</span>
                  <span className="muted" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.message ?? ''}>{p.message}</span>
                  {p.externalId && <span className="mono muted" style={{ fontSize: 10 }}>{p.externalId}</span>}
                  <span className="muted" style={{ fontSize: 11 }}>{relTime(p.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 12 }}>Платежей не было</div>
          )}
        </div>

        {/* Status history */}
        {order.statusHistory.length > 0 && (
          <div className="hairt" style={{ marginTop: 20, paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>История статусов</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...order.statusHistory].reverse().map((h) => (
                <div key={h.id} className="row-gap" style={{ gap: 10, fontSize: 12 }}>
                  <span className={`pill ${STATUS_MAP[h.toStatus]?.pill ?? ''}`} style={{ fontSize: 10 }}>
                    {STATUS_MAP[h.toStatus]?.label ?? h.toStatus}
                  </span>
                  <span className="muted">{h.comment}</span>
                  <span className="muted" style={{ marginLeft: 'auto', fontSize: 11 }}>{relTime(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="hairt" style={{ marginTop: 16, paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Заметки</div>
            <div className="muted" style={{ fontSize: 12 }}>{order.notes}</div>
          </div>
        )}

        {/* Actions */}
        <div className="row-gap hairt" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 18 }}>
          <button onClick={onClose} className="btn btn-secondary">Закрыть</button>
          {canCancel && (
            <button onClick={handleCancel} disabled={loading !== null} className="btn btn-secondary"
              style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
              {loading === 'cancelled' ? '…' : 'Отменить заказ'}
            </button>
          )}
          {canApprove && allowedTransitions.includes('confirmed') && (
            <button onClick={handleApprove} disabled={loading !== null} className="btn btn-primary">
              {loading === 'confirmed' ? '…' : 'Подтвердить'}
            </button>
          )}
          {/* Dynamic FSM transition buttons for all other valid statuses */}
          {allowedTransitions
            .filter(s => s !== 'confirmed' && s !== 'cancelled')
            .map(targetStatus => (
              <button
                key={targetStatus}
                onClick={() => handleTransition(targetStatus)}
                disabled={loading !== null}
                className="btn btn-primary"
              >
                {loading === targetStatus ? '…' : STATUS_MAP[targetStatus]?.label ?? targetStatus}
              </button>
            ))}
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export default function OrdersPage() {
  const { pushToast } = useToast();
  const { user } = useAuth();
  const managerView = isManagerRole(user?.role);

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<OrderDTO | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders({ status: tab || undefined, search: search || undefined, page, limit: 20 });
      setOrders(res.data);
      setMeta(res.meta);
    } catch {
      pushToast('Ошибка загрузки', 'error');
    }
    setLoading(false);
  }, [tab, search, page, pushToast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [tab, search]);
  useEffect(() => {
    if (detail) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }
    return;
  }, [detail]);

  const openDetail = async (id: string) => {
    try {
      const order = await getOrder(id);
      setDetail(order);
    } catch {
      pushToast('Ошибка загрузки заказа', 'error');
    }
  };

  // ════════════════════════════════════════════════════════
  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Заказы</div>
          <div className="page-sub">Все заказы в работе и архиве</div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="filter-bar">
        <div className="seg">
          {STATUS_TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'active' : ''}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div className="row-gap" style={{
          height: 36, padding: '0 12px', borderRadius: 8,
          border: '1px solid var(--border)', background: '#fff', gap: 10, minWidth: 260,
        }}>
          <AI.search style={{ color: 'var(--ink-3)', flexShrink: 0 }}/>
          <input
            placeholder="Поиск по № заказа…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Загрузка...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
            {search ? 'Ничего не найдено' : 'Заказов пока нет'}
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>№ заказа</th>
                  <th>Позиций</th>
                  <th style={{ textAlign: 'right' }}>Сумма</th>
                  <th>Промокод</th>
                  <th>Статус</th>
                  <th>Оплата</th>
                  <th>Дата</th>
                  <th style={{ textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const st = STATUS_MAP[o.status] ?? { label: o.status, pill: '', step: 0 };
                  return (
                    <tr key={o.id}>
                      <td>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                          {o.orderNumber}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{o.items.length}</td>
                      <td className="num" style={{ fontWeight: 700 }}>
                        {fmtTng(Number(o.total))} ₸
                        {Number(o.discount) > 0 && <div className="muted" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ok)' }}>−{fmtTng(Number(o.discount))} ₸</div>}
                      </td>
                      <td>
                        {o.promoCode ? <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{o.promoCode}</span> : <span className="muted">—</span>}
                        {o.services?.length > 0 && <div className="muted" style={{ fontSize: 11 }}>+{o.services.length} усл.</div>}
                      </td>
                      <td>
                        <span className={`pill ${st.pill}`}><span className="dot"/>{st.label}</span>
                      </td>
                      <td>
                        <PaymentPill status={o.paymentStatus} />
                        {o.paymentMethod && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{PAYMENT_METHODS[o.paymentMethod] ?? o.paymentMethod}</div>}
                      </td>
                      <td className="muted" style={{ fontSize: 12 }}>{relTime(o.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-gap" style={{ gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => openDetail(o.id)} className="btn btn-ghost btn-sm">
                            Открыть <AI.arrR/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="row between" style={{ padding: '10px 16px', borderTop: '1px solid var(--hair)' }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  {meta.total} заказов · стр. {meta.page} из {meta.totalPages}
                </div>
                <div className="row-gap" style={{ gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn btn-ghost btn-sm">← Назад</button>
                  <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages} className="btn btn-ghost btn-sm">Вперёд →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <OrderDetailModal
          order={detail}
          managerView={managerView}
          onClose={() => setDetail(null)}
          onAction={() => { setDetail(null); fetchData(); }}
        />
      )}
    </div>
  );
}
