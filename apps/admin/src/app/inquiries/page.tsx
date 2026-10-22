'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AI } from '@/lib/icons';
import { useToast } from '@/components/Toast';
import {
  getInquiryStats,
  getInquiries,
  createInquiry,
  type InquiryStats,
  type InquiryDTO,
} from '@/lib/api/admin';
import { fmtTng } from '@/lib/formatters';

// ── Status & priority maps ──────────────────────────────────────────

const STATUS_MAP = {
  new:         { label: 'Новая',       pill: 'pill-info' },
  in_progress: { label: 'В работе',    pill: 'pill-warn' },
  quoted:      { label: 'Выслано КП',  pill: 'pill-purple' },
  closed:      { label: 'Закрыта',     pill: 'pill-ok' },
  cancelled:   { label: 'Отменена',    pill: '' },
};

const STATUS_TABS = [
  { id: '',          label: 'Все' },
  { id: 'new',       label: 'Новые' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'quoted',    label: 'КП отправлено' },
  { id: 'closed',    label: 'Закрыто' },
];

// ── Relative time helper ────────────────────────────────────────────

function formatKazakhstanDateTime(dateStr: string): string {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Almaty',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(dateStr));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('day')}.${value('month')}.${value('year')} ${value('hour')}:${value('minute')}`;
}

// ── Inquiry form modal ──────────────────────────────────────────────

interface InquiryFormData {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  items: Array<{ sku: string; name: string; quantity: number; unitPrice: number }>;
}

const EMPTY_FORM: InquiryFormData = {
  companyName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
  items: [],
};

function InquiryModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: InquiryFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<InquiryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sku, setSku] = useState('');
  const [iname, setIName] = useState('');
  const [iqty, setIQty] = useState(1);
  const [iprice, setIPrice] = useState(0);
  const [skuSuggestions, setSkuSuggestions] = useState<any[]>([]);
  const [skuFocused, setSkuFocused] = useState(false);

  // Autocomplete: search products when SKU changes
  const searchSku = React.useRef(0);
  const handleSkuChange = (val: string) => {
    setSku(val);
    if (val.trim().length < 2) { setSkuSuggestions([]); return; }
    const id = ++searchSku.current;
    setTimeout(() => {
      if (id !== searchSku.current) return;
      fetch(`/api/v1/products?search=${encodeURIComponent(val)}&limit=5`)
        .then(r => r.json())
        .then(d => setSkuSuggestions(d.data || []))
        .catch(() => setSkuSuggestions([]));
    }, 200);
  };

  const selectSkuProduct = (p: any) => {
    setSku(p.variantId || '');
    setIName(p.title || '');
    setIPrice(Number(p.price) || 0);
    setSkuSuggestions([]);
    setSkuFocused(false);
  };

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const addItem = () => {
    if (!sku.trim() || !iname.trim() || iqty < 1) return;
    setForm((f) => ({
      ...f,
      items: [...f.items, { sku: sku.trim(), name: iname.trim(), quantity: iqty, unitPrice: iprice }],
    }));
    setSku(''); setIName(''); setIQty(1); setIPrice(0); setSkuSuggestions([]);
  };

  const removeItem = (idx: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.contactName.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } catch { /* toast in parent */ }
    setSaving(false);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="inquiry-modal-title" style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(15,17,23,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <button type="button" onClick={onClose} aria-label="Закрыть заявку" style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }} />
      <div style={{
        position: 'relative',
        width: 900, maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 32px)',
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-3)', overflow: 'hidden',
      }}>
        <div style={{ padding: '30px 34px 0', overflow: 'auto', flex: '1 1 auto' }}>
          <div id="inquiry-modal-title" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 22 }}>
            Новая заявка
          </div>

        {/* Company & contact grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 22 }}>
          <Field label="Компания *" value={form.companyName} onChange={(v) => setForm((f) => ({ ...f, companyName: v }))} />
          <Field label="Контактное лицо *" value={form.contactName} onChange={(v) => setForm((f) => ({ ...f, contactName: v }))} />
          <Field label="Телефон" value={form.contactPhone} onChange={(v) => setForm((f) => ({ ...f, contactPhone: v }))} />
          <Field label="Email" value={form.contactEmail} onChange={(v) => setForm((f) => ({ ...f, contactEmail: v }))} />
        </div>

        {/* Items */}
        <div style={{ marginTop: 18 }}>
          <div className="field-label">Позиции</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 70px 100px 40px', gap: 8, marginTop: 6, alignItems: 'end' }}>
            <div style={{ position: 'relative' }}>
              <label htmlFor="inquiry-item-sku" style={{ fontSize: 10, color: 'var(--ink-3)', display: 'block', marginBottom: 3, fontWeight: 600 }}>Артикул</label>
              <input id="inquiry-item-sku" placeholder="SKU или название" value={sku} onChange={(e) => handleSkuChange(e.target.value)}
                onFocus={() => setSkuFocused(true)} onBlur={() => setTimeout(() => setSkuFocused(false), 200)}
                style={{ width: '100%', height: 34, padding: '0 8px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }} />
              {skuFocused && skuSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 99999,
                  background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                  marginTop: 2, maxHeight: 200, overflow: 'auto', boxShadow: 'var(--shadow-2)',
                }}>
                  {skuSuggestions.map((p: any) => (
                    <button key={p.id} type="button" onMouseDown={() => selectSkuProduct(p)} style={{
                      width: '100%', padding: '8px 10px', cursor: 'pointer', fontSize: 12,
                      borderBottom: '1px solid var(--hair)',
                      borderTop: 0, borderLeft: 0, borderRight: 0, background: '#fff', textAlign: 'left',
                    }}>
                      <div style={{ fontWeight: 600 }}>{p.variantId}</div>
                      <div style={{ color: 'var(--ink-2)', fontSize: 11 }}>{p.title}</div>
                      <div className="num" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{Number(p.price).toLocaleString('ru-RU')} ₸</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="inquiry-item-name" style={{ fontSize: 10, color: 'var(--ink-3)', display: 'block', marginBottom: 3, fontWeight: 600 }}>Название</label>
              <input id="inquiry-item-name" placeholder="Название товара" value={iname} onChange={(e) => setIName(e.target.value)}
                style={{ width: '100%', height: 34, padding: '0 8px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }} />
            </div>
            <div>
              <label htmlFor="inquiry-item-quantity" style={{ fontSize: 10, color: 'var(--ink-3)', display: 'block', marginBottom: 3, fontWeight: 600 }}>Кол-во</label>
              <input id="inquiry-item-quantity" type="number" placeholder="1" value={iqty} onChange={(e) => setIQty(Number(e.target.value))} min={1}
                style={{ width: '100%', height: 34, padding: '0 8px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }} />
            </div>
            <div>
              <label htmlFor="inquiry-item-price" style={{ fontSize: 10, color: 'var(--ink-3)', display: 'block', marginBottom: 3, fontWeight: 600 }}>Цена, ₸</label>
              <input id="inquiry-item-price" type="number" placeholder="0" value={iprice} onChange={(e) => setIPrice(Number(e.target.value))} min={0}
                style={{ width: '100%', height: 34, padding: '0 8px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }} />
            </div>
            <button type="button" onClick={addItem} className="btn btn-primary btn-sm" style={{ height: 34 }}>+</button>
          </div>
          {form.items.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {form.items.map((it, i) => (
                <div key={i} className="row-gap" style={{
                  justifyContent: 'space-between', padding: '6px 10px',
                  background: 'var(--surface-2)', borderRadius: 8, fontSize: 12,
                }}>
                  <span className="mono" style={{ fontWeight: 600 }}>{it.sku}</span>
                  <span style={{ flex: 1, marginLeft: 10, color: 'var(--ink-2)' }}>{it.name}</span>
                  <span style={{ fontWeight: 700 }}>{it.quantity} × {fmtTng(it.unitPrice)} ₸</span>
                  <button type="button" onClick={() => removeItem(i)} style={{
                    marginLeft: 10, border: 'none', background: 'none', cursor: 'pointer',
                    color: 'var(--red)', padding: '2px 6px',
                  }}><AI.close /></button>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                Итого: {fmtTng(form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))} ₸
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginTop: 20, marginBottom: 8 }}>
          <label htmlFor="inquiry-notes" className="field-label">Комментарий клиента</label>
          <div style={{ color: 'var(--ink-4)', fontSize: 11, marginTop: 3 }}>
            Полный текст запроса клиента. Переносы строк сохраняются.
          </div>
          <textarea
            id="inquiry-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={8}
            style={{
              width: '100%', minHeight: 170, marginTop: 8, padding: '12px 14px', fontSize: 13,
              lineHeight: 1.55, color: 'var(--ink)',
              borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)',
              resize: 'vertical',
            }}
          />
        </div>

        </div>
        {/* Actions — outside scrollable, fixed at bottom of card */}
        <div style={{ padding: '16px 34px 24px', borderTop: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
          <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={saving}>Отмена</button>
            <button type="button" onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? '…' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Simple labeled input ─────────────────────────────────────────────

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="field-label" style={{ display: 'block' }}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, fontWeight: 600,
          borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)',
          color: 'var(--ink)', outline: 'none',
        }}
      />
    </label>
  );
}

function InquiryViewModal({ inquiry, onClose }: { inquiry: InquiryDTO; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  const status = STATUS_MAP[inquiry.status as keyof typeof STATUS_MAP] ?? { label: inquiry.status, pill: '' };
  const items = inquiry.items ?? [];

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="comment-modal-title" style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(15,17,23,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <button type="button" onClick={onClose} aria-label="Закрыть заявку" style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent' }} />
      <div className="card" style={{ position: 'relative', width: 920, maxWidth: '100%', maxHeight: 'calc(100vh - 40px)', boxShadow: 'var(--shadow-3)', overflow: 'hidden' }}>
        <div className="row between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div id="comment-modal-title" style={{ fontSize: 18, fontWeight: 800 }}>Просмотр заявки</div>
            <div className="muted" style={{ marginTop: 3 }}>{inquiry.inquiryNumber} · {inquiry.companyName}</div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Закрыть"><AI.close /></button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18, alignItems: 'start' }}>
            <section style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ReadOnlyField label="Компания" value={inquiry.companyName} />
                <ReadOnlyField label="Контактное лицо" value={inquiry.contactName} />
                <ReadOnlyField label="Телефон" value={inquiry.contactPhone || 'Не указан'} />
                <ReadOnlyField label="Email" value={inquiry.contactEmail || 'Не указан'} />
              </div>

              <div>
                <div className="field-label">Позиции</div>
                {items.length > 0 ? (
                  <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    {items.map((item, index) => (
                      <div
                        key={`${item.sku}-${index}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '90px minmax(0, 1fr) 70px 120px',
                          gap: 10,
                          padding: '10px 12px',
                          borderTop: index === 0 ? 0 : '1px solid var(--hair)',
                          alignItems: 'center',
                          fontSize: 12,
                        }}
                      >
                        <span className="mono" style={{ fontWeight: 800, color: 'var(--ink)' }}>{item.sku || '—'}</span>
                        <span style={{ minWidth: 0, color: 'var(--ink-2)', overflowWrap: 'anywhere' }}>{item.name || 'Без названия'}</span>
                        <span className="num" style={{ textAlign: 'right', fontWeight: 700 }}>{item.quantity}</span>
                        <span className="num" style={{ textAlign: 'right', fontWeight: 800 }}>{fmtTng(Number(item.unitPrice))} ₸</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="muted" style={{ marginTop: 8, padding: 14, borderRadius: 10, background: 'var(--surface-2)', fontSize: 13 }}>
                    Позиции не указаны
                  </div>
                )}
              </div>

              <div>
                <div className="field-label">Комментарий клиента</div>
                <div style={{
                  marginTop: 8,
                  padding: 16,
                  minHeight: 110,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  fontSize: 14,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}>
                  {inquiry.notes || 'Комментарий не оставлен'}
                </div>
              </div>
            </section>

            <aside style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface-2)' }}>
                <div className="field-label">Статус</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`pill ${status.pill}`}>
                    <span className="dot" />
                    {status.label}
                  </span>
                </div>
              </div>
              <ReadOnlyField label="Сумма" value={`${fmtTng(Number(inquiry.totalAmount))} ₸`} strong />
              <ReadOnlyField label="Количество позиций" value={String(inquiry.itemCount)} />
              <ReadOnlyField label="Приоритет" value={inquiry.priority} />
              <ReadOnlyField label="Создана" value={formatKazakhstanDateTime(inquiry.createdAt)} />
              <ReadOnlyField label="Обновлена" value={formatKazakhstanDateTime(inquiry.updatedAt)} />
            </aside>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ReadOnlyField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: '#fff' }}>
      <div className="field-label" style={{ marginBottom: 5 }}>{label}</div>
      <div style={{ color: 'var(--ink)', fontSize: strong ? 18 : 13, fontWeight: strong ? 850 : 700, overflowWrap: 'anywhere' }}>
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function InquiriesPage() {
  const { pushToast } = useToast();

  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [inquiries, setInquiries] = useState<InquiryDTO[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingInquiry, setViewingInquiry] = useState<InquiryDTO | null>(null);

  // ── Fetch data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        getInquiryStats(),
        getInquiries({ status: tab || undefined, search: search || undefined, page, limit: 20 }),
      ]);
      setStats(statsRes);
      setInquiries(listRes.data);
      setMeta(listRes.meta);
    } catch (e) {
      pushToast('Ошибка загрузки данных', 'error');
    }
    setLoading(false);
  }, [tab, search, page, pushToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when tab or search changes
  useEffect(() => { setPage(1); }, [tab, search]);

  // ── Handlers ────────────────────────────────────────────
  const handleCreate = async (data: InquiryFormData) => {
    try {
      await createInquiry(data as any);
      pushToast('Заявка создана', 'success');
      fetchData();
    } catch {
      pushToast('Ошибка создания', 'error');
      throw new Error('create failed');
    }
  };

  const openCreate = () => {
    setModalOpen(true);
  };

  // ── KPI cards ───────────────────────────────────────────
  const kpis = stats ? [
    { label: 'Среднее время ответа', value: `${stats.avgResponseTime} мин`, delta: '', up: true, tone: 'info' as const },
    { label: 'Конверсия в КП',       value: `${stats.conversionRate}%`,    delta: '', up: true, tone: 'ok' as const },
    { label: 'Средний чек',          value: `${fmtTng(stats.avgCheck)} ₸`, delta: '', up: true, tone: 'ink' as const },
    { label: 'Заявок в работе',      value: String(stats.active),         delta: stats.todayDelta > 0 ? `+${stats.todayDelta} сегодня` : `${stats.todayDelta} сегодня`, up: stats.todayDelta >= 0, tone: 'red' as const },
  ] : [];

  // ════════════════════════════════════════════════════════
  return (
    <div className="page">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-title">Заявки</div>
          <div className="page-sub">Входящие запросы от B2B-клиентов</div>
        </div>
        <div className="row-gap" style={{ gap: 8 }}>
          <button onClick={openCreate} className="btn btn-primary"><AI.plus /> Новая заявка</button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {kpis.map((k) => (
            <div key={k.label} className="card" style={{
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div className="eyebrow">{k.label}</div>
              <div className="row between" style={{ alignItems: 'flex-end' }}>
                <div className="num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  {k.value}
                </div>
                {k.delta && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: k.up ? 'var(--ok)' : 'var(--red)',
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    {k.up ? <AI.arrUp /> : <AI.arrDown />}{k.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs + Search ──────────────────────────────── */}
      <div className="filter-bar">
        <div className="seg">
          {STATUS_TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'active' : ''}>
              {t.label}
              {t.id && (
                <span className="mono" style={{ fontSize: 10, opacity: 0.65, marginLeft: 4 }}>
                  {t.id === '' ? '' : inquiries.filter((i) => i.status === t.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="row-gap" style={{
          height: 36, padding: '0 12px', borderRadius: 8,
          border: '1px solid var(--border)', background: '#fff',
          gap: 10, minWidth: 280,
        }}>
          <AI.search style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            placeholder="Поиск по № заявки или компании…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, border: 0, outline: 0, background: 'transparent',
              fontSize: 13, fontWeight: 600, color: 'var(--ink)',
            }}
          />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────── */}
      <div className="card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            Загрузка...
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
            {search ? 'Ничего не найдено по вашему запросу' : 'Нет заявок. Создайте первую!'}
          </div>
        ) : (
          <>
            <table className="table" style={{ minWidth: 1120 }}>
              <thead>
                <tr>
                  <th>№ заявки</th>
                  <th>Компания</th>
                  <th>Контакт</th>
                  <th style={{ textAlign: 'right' }}>Позиций</th>
                  <th style={{ textAlign: 'right' }}>Сумма</th>
                  <th style={{ width: 260 }}>Комментарий</th>
                  <th>Статус</th>
                  <th>Время</th>
                  <th style={{ textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => {
                  const st = STATUS_MAP[inq.status as keyof typeof STATUS_MAP] ?? { label: inq.status, pill: '' };
                  return (
                    <tr key={inq.id}>
                      <td>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700 }}>
                          {inq.inquiryNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                          {inq.companyName}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
                          {inq.contactName}
                        </div>
                        {inq.contactPhone && (
                          <a href={`tel:${inq.contactPhone.replace(/[^\d+]/g, '')}`} className="mono" style={{ display: 'block', fontSize: 11, color: 'var(--red)', marginTop: 3, textDecoration: 'none', fontWeight: 700 }}>
                            {inq.contactPhone}
                          </a>
                        )}
                        {inq.contactEmail && (
                          <a href={`mailto:${inq.contactEmail}`} className="mono" style={{ display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: 'var(--ink-3)', marginTop: 3, textDecoration: 'none' }} title={inq.contactEmail}>
                            {inq.contactEmail}
                          </a>
                        )}
                      </td>
                      <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}>
                        {inq.itemCount}
                      </td>
                      <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}>
                        {fmtTng(Number(inq.totalAmount))} ₸
                      </td>
                      <td>
                        {inq.notes ? (
                          <button
                            type="button"
                            onClick={() => setViewingInquiry(inq)}
                            title="Открыть заявку полностью"
                            style={{
                              width: '100%', maxWidth: 260, padding: '7px 9px', border: '1px solid var(--border)',
                              borderRadius: 8, background: 'var(--surface-2)', color: 'var(--ink-2)', textAlign: 'left',
                              fontSize: 12, lineHeight: 1.4,
                            }}
                          >
                            <span style={{
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
                            }}>
                              {inq.notes}
                            </span>
                            <span style={{ display: 'block', marginTop: 4, color: 'var(--red)', fontSize: 11, fontWeight: 700 }}>Открыть заявку</span>
                          </button>
                        ) : (
                          <span className="muted" style={{ fontSize: 12 }}>Нет комментария</span>
                        )}
                      </td>
                      <td>
                        <span className={`pill ${st.pill}`}>
                          <span className="dot" />
                          {st.label}
                        </span>
                      </td>
                      <td className="num" style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--ink-2)', fontWeight: 600 }}>
                        {formatKazakhstanDateTime(inq.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-gap" style={{ gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setViewingInquiry(inq)}
                            className="btn btn-secondary btn-sm"
                            title="Просмотреть заявку"
                            aria-label="Просмотреть заявку полностью"
                          >
                            <AI.eye /> Просмотр
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
                  {meta.total} заявок · стр. {meta.page} из {meta.totalPages}
                </div>
                <div className="row-gap" style={{ gap: 6 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn btn-ghost btn-sm"
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page >= meta.totalPages}
                    className="btn btn-ghost btn-sm"
                  >
                    Вперёд →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create modal ────────────────────────────────── */}
      <InquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />

      {viewingInquiry && <InquiryViewModal inquiry={viewingInquiry} onClose={() => setViewingInquiry(null)} />}
    </div>
  );
}
