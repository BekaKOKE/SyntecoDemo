'use client';

import { useState, useEffect, useCallback } from 'react';
import { AI } from '@/lib/icons';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  getPromotions,
  getPromotionStrategies,
  createPromotion,
  updatePromotion,
  deletePromotion,
  type PromotionDTO,
  type PromotionInput,
  type PromotionStrategy,
} from '@/lib/api/admin';
import { fmtKZT } from '@/lib/formatters';

type Tier = { minQuantity: string; percent: string };

interface FormState {
  code: string;
  name: string;
  description: string;
  strategy: PromotionStrategy;
  value: string;
  maxDiscount: string;
  tiers: Tier[];
  buy: string;
  free: string;
  minOrderAmount: string;
  usageLimit: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  code: '', name: '', description: '', strategy: 'percentage', value: '10', maxDiscount: '',
  tiers: [{ minQuantity: '10', percent: '3' }], buy: '3', free: '1',
  minOrderAmount: '', usageLimit: '', validFrom: '', validTo: '', isActive: true,
};

const toDateInput = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('sv-SE') : '');

function fromPromotion(p: PromotionDTO): FormState {
  return {
    code: p.code,
    name: p.name,
    description: p.description ?? '',
    strategy: p.strategy,
    value: String(p.value ?? 0),
    maxDiscount: p.params?.maxDiscount != null ? String(p.params.maxDiscount) : '',
    tiers: p.params?.tiers?.length
      ? p.params.tiers.map(t => ({ minQuantity: String(t.minQuantity), percent: String(t.percent) }))
      : EMPTY_FORM.tiers,
    buy: String(p.params?.buy ?? 3),
    free: String(p.params?.free ?? 1),
    minOrderAmount: p.minOrderAmount ? String(p.minOrderAmount) : '',
    usageLimit: p.usageLimit != null ? String(p.usageLimit) : '',
    validFrom: toDateInput(p.validFrom),
    validTo: toDateInput(p.validTo),
    isActive: p.isActive,
  };
}

function toInput(f: FormState): PromotionInput {
  const params: PromotionInput['params'] = {};
  let value = Number(f.value) || 0;
  if (f.strategy === 'percentage' && f.maxDiscount) params.maxDiscount = Number(f.maxDiscount);
  if (f.strategy === 'volume_tier') {
    params.tiers = f.tiers
      .filter(t => t.minQuantity && t.percent)
      .map(t => ({ minQuantity: Number(t.minQuantity), percent: Number(t.percent) }))
      .sort((a, b) => a.minQuantity - b.minQuantity);
    value = 0;
  }
  if (f.strategy === 'buy_x_get_y') {
    params.buy = Number(f.buy);
    params.free = Number(f.free);
    value = 0;
  }
  return {
    code: f.code.trim().toUpperCase(),
    name: f.name.trim(),
    description: f.description.trim(),
    strategy: f.strategy,
    value,
    params,
    minOrderAmount: Number(f.minOrderAmount) || 0,
    usageLimit: f.usageLimit ? Number(f.usageLimit) : null,
    isActive: f.isActive,
    validFrom: f.validFrom ? new Date(`${f.validFrom}T00:00:00`).toISOString() : null,
    validTo: f.validTo ? new Date(`${f.validTo}T23:59:59`).toISOString() : null,
  };
}

function summary(p: PromotionDTO): string {
  switch (p.strategy) {
    case 'percentage':
      return `${p.value}%${p.params?.maxDiscount ? `, не более ${fmtKZT(p.params.maxDiscount)}` : ''}`;
    case 'fixed_amount':
      return fmtKZT(Number(p.value));
    case 'volume_tier':
      return (p.params?.tiers ?? []).map(t => `от ${t.minQuantity} шт −${t.percent}%`).join(' · ') || '—';
    case 'buy_x_get_y':
      return `${p.params?.buy ?? '?'} + ${p.params?.free ?? '?'} бесплатно`;
    default:
      return String(p.value);
  }
}

const isExpired = (p: PromotionDTO) => !!p.validTo && new Date(p.validTo).getTime() < Date.now();

const fieldStyle: React.CSSProperties = {
  width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none',
};

function FF({ label, value, onChange, type = 'text', placeholder, suffix }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; suffix?: string;
}) {
  return (
    <label className="field-label" style={{ display: 'block' }}>
      {label}
      <div style={{ position: 'relative' }}>
        <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{ ...fieldStyle, paddingRight: suffix ? 34 : 12 }} />
        {suffix && <span className="muted" style={{ position: 'absolute', right: 12, top: 15, fontSize: 12 }}>{suffix}</span>}
      </div>
    </label>
  );
}

// ── Create / edit modal ───────────────────────────────────────────

function PromotionModal({ initial, strategies, onClose, onSaved }: {
  initial: PromotionDTO | null;
  strategies: { type: PromotionStrategy; label: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial ? fromPromotion(initial) : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));
  const setTier = (i: number, k: keyof Tier, v: string) =>
    setForm(f => ({ ...f, tiers: f.tiers.map((t, j) => (j === i ? { ...t, [k]: v } : t)) }));

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) { setError('Заполните код и название'); return; }
    setSaving(true); setError('');
    try {
      const data = toInput(form);
      if (initial) await updatePromotion(initial.id, data);
      else await createPromotion(data);
      onSaved();
    } catch (e: any) {
      setError(e?.message || 'Ошибка сохранения');
    }
    setSaving(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="promo-modal-title" style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.4)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <button type="button" onClick={onClose} aria-label="Закрыть форму промокода" style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }} />
      <div style={{ position: 'relative', width: 560, maxHeight: 'calc(100vh - 40px)', overflow: 'auto', background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-3)', padding: 30 }}>
        <div id="promo-modal-title" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 20 }}>
          {initial ? `Промокод ${initial.code}` : 'Новый промокод'}
        </div>
        {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
            <FF label="Код *" value={form.code} onChange={v => set('code', v.toUpperCase())} placeholder="SAFETY10" />
            <FF label="Название *" value={form.name} onChange={v => set('name', v)} placeholder="Скидка 10% на СИЗ" />
          </div>
          <FF label="Описание" value={form.description} onChange={v => set('description', v)} />

          <div>
            <label htmlFor="promo-strategy" className="field-label">Стратегия расчёта</label>
            <select id="promo-strategy" value={form.strategy} onChange={e => set('strategy', e.target.value as PromotionStrategy)} style={fieldStyle}>
              {strategies.map(s => <option key={s.type} value={s.type}>{s.label}</option>)}
            </select>
            {initial && form.strategy !== initial.strategy && (
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Алгоритм скидки переключится сразу после сохранения.</div>
            )}
          </div>

          {/* Strategy-specific params */}
          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Параметры стратегии</div>
            {form.strategy === 'percentage' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FF label="Процент *" type="number" value={form.value} onChange={v => set('value', v)} suffix="%" />
                <FF label="Макс. скидка" type="number" value={form.maxDiscount} onChange={v => set('maxDiscount', v)} placeholder="без лимита" suffix="₸" />
              </div>
            )}
            {form.strategy === 'fixed_amount' && (
              <FF label="Сумма скидки *" type="number" value={form.value} onChange={v => set('value', v)} suffix="₸" />
            )}
            {form.strategy === 'volume_tier' && (
              <div style={{ display: 'grid', gap: 8 }}>
                {form.tiers.map((t, i) => (
                  <div key={i} className="row-gap" style={{ gap: 10, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}><FF label={i === 0 ? 'От, шт' : ''} type="number" value={t.minQuantity} onChange={v => setTier(i, 'minQuantity', v)} /></div>
                    <div style={{ flex: 1 }}><FF label={i === 0 ? 'Скидка на позицию' : ''} type="number" value={t.percent} onChange={v => setTier(i, 'percent', v)} suffix="%" /></div>
                    <button type="button" onClick={() => set('tiers', form.tiers.filter((_, j) => j !== i))} disabled={form.tiers.length <= 1}
                      className="btn btn-ghost btn-sm" style={{ height: 38 }} title="Удалить порог"><AI.trash /></button>
                  </div>
                ))}
                <button type="button" onClick={() => set('tiers', [...form.tiers, { minQuantity: '', percent: '' }])} className="btn btn-secondary btn-sm" style={{ justifySelf: 'start' }}>
                  <AI.plus /> Добавить порог
                </button>
              </div>
            )}
            {form.strategy === 'buy_x_get_y' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FF label="Купить, шт *" type="number" value={form.buy} onChange={v => set('buy', v)} />
                <FF label="Бесплатно, шт *" type="number" value={form.free} onChange={v => set('free', v)} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FF label="Мин. сумма заказа" type="number" value={form.minOrderAmount} onChange={v => set('minOrderAmount', v)} placeholder="0" suffix="₸" />
            <FF label="Лимит использований" type="number" value={form.usageLimit} onChange={v => set('usageLimit', v)} placeholder="без лимита" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FF label="Действует с" type="date" value={form.validFrom} onChange={v => set('validFrom', v)} />
            <FF label="Действует до" type="date" value={form.validTo} onChange={v => set('validTo', v)} />
          </div>
          <label className="row-gap" style={{ gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor: 'var(--red)' }} />
            Активен
          </label>
        </div>

        <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary">Отмена</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>{saving ? '…' : initial ? 'Сохранить' : 'Создать'}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function PromotionsPage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<PromotionDTO[]>([]);
  const [strategies, setStrategies] = useState<{ type: PromotionStrategy; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PromotionDTO | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<PromotionDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getPromotions());
    } catch {
      pushToast('Ошибка загрузки', 'error');
    }
    setLoading(false);
  }, [pushToast]);

  useEffect(() => {
    fetchData();
    getPromotionStrategies().then(setStrategies).catch(() => {});
  }, [fetchData]);

  const strategyLabel = (t: string) => strategies.find(s => s.type === t)?.label ?? t;

  const toggleActive = async (p: PromotionDTO) => {
    try {
      const updated = await updatePromotion(p.id, { isActive: !p.isActive });
      setItems(list => list.map(x => (x.id === p.id ? updated : x)));
      pushToast(updated.isActive ? `${p.code} активирован` : `${p.code} отключён`);
    } catch (e: any) {
      pushToast(e?.message || 'Ошибка', 'error');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deletePromotion(toDelete.id);
      pushToast(`Промокод ${toDelete.code} удалён`);
      setToDelete(null);
      fetchData();
    } catch (e: any) {
      pushToast(e?.message || 'Ошибка удаления', 'error');
    }
    setDeleting(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Промокоды</div>
          <div className="page-sub">Скидки и стратегии расчёта · стратегию можно сменить без перезапуска</div>
        </div>
        <button onClick={() => setEditing('new')} className="btn btn-primary"><AI.plus /> Новый промокод</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Промокодов пока нет</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Название</th>
                  <th>Стратегия</th>
                  <th>Скидка</th>
                  <th style={{ textAlign: 'right' }}>Мин. заказ</th>
                  <th style={{ textAlign: 'center' }}>Использовано</th>
                  <th>Статус</th>
                  <th>Действует до</th>
                  <th style={{ textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => {
                  const expired = isExpired(p);
                  return (
                    <tr key={p.id}>
                      <td><span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{p.code}</span></td>
                      <td style={{ maxWidth: 240 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        {p.description && <div className="muted" style={{ fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.description}>{p.description}</div>}
                      </td>
                      <td><span className="pill pill-info">{strategyLabel(p.strategy)}</span></td>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{summary(p)}</td>
                      <td className="num" style={{ textAlign: 'right', fontSize: 12 }}>{p.minOrderAmount ? fmtKZT(Number(p.minOrderAmount)) : '—'}</td>
                      <td className="num" style={{ textAlign: 'center', fontSize: 12, fontWeight: 600 }}>{p.usedCount} / {p.usageLimit ?? '∞'}</td>
                      <td>
                        <button onClick={() => toggleActive(p)} title={p.isActive ? 'Отключить' : 'Активировать'}
                          className={`pill ${expired ? 'pill-red' : p.isActive ? 'pill-ok' : ''}`} style={{ border: 0, cursor: 'pointer' }}>
                          <span className="dot" />{expired ? 'Истёк' : p.isActive ? 'Активен' : 'Отключён'}
                        </button>
                      </td>
                      <td className="muted" style={{ fontSize: 12 }}>{p.validTo ? new Date(p.validTo).toLocaleDateString('ru-RU') : 'бессрочно'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-gap" style={{ gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditing(p)} className="btn btn-ghost btn-sm" title="Редактировать"><AI.edit /></button>
                          <button onClick={() => setToDelete(p)} className="btn btn-ghost btn-sm" title="Удалить" style={{ color: 'var(--red)' }}><AI.trash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <PromotionModal
          initial={editing === 'new' ? null : editing}
          strategies={strategies}
          onClose={() => setEditing(null)}
          onSaved={() => { pushToast(editing === 'new' ? 'Промокод создан' : 'Изменения сохранены'); setEditing(null); fetchData(); }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title={`Удалить ${toDelete.code}?`}
          message="Промокод перестанет применяться к новым заказам. Уже оформленные заказы не изменятся."
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
