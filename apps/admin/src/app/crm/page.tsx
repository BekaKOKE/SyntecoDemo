'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AI } from '@/lib/icons';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  getPipeline, createDeal, updateDeal, deleteDeal,
  type DealDTO, type PipelineColumn,
} from '@/lib/api/admin';
import { fmtTng } from '@/lib/formatters';

const STAGE_COLORS = ['var(--ink-4)', 'var(--info)', 'var(--warn)', 'var(--red)', 'var(--ok)'];

// ── Deal card ──────────────────────────────────────────────────────

function KanbanCard({ deal, idx, onEdit, onDragStart, onDragEnd }: {
  deal: DealDTO; idx: number;
  onEdit: (d: DealDTO) => void;
  onDragStart: (d: DealDTO) => void;
  onDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={() => onDragStart(deal)}
      onDragEnd={onDragEnd}
      style={{
        background: '#fff', border: '1px solid var(--border)',
        borderLeftWidth: deal.hot ? 3 : 1,
        borderLeftColor: deal.hot ? 'var(--red)' : 'var(--border)',
        borderRadius: 10, padding: 14, cursor: 'grab',
        marginBottom: 8, transition: 'box-shadow .15s',
        animationDelay: `${idx * 40}ms`,
        fontSize: 13,
        width: '100%', textAlign: 'left', color: 'inherit',
      }}
      className="fade-up"
      onClick={() => onEdit(deal)}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="row between" style={{ alignItems: 'flex-start', gap: 8 }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 600 }}>
          {deal.dealNumber}
        </span>
        {deal.hot && (
          <span className="pill pill-red" style={{ fontSize: 10, height: 18, padding: '0 6px' }}>
            <AI.fire /> Горячая
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, lineHeight: 1.35 }}>
        {deal.title}
      </div>
      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
        {deal.companyName}
      </div>
      <div className="row between" style={{ marginTop: 10, alignItems: 'center' }}>
        <span className="num" style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>
          {fmtTng(deal.value)} ₸
        </span>
        <div className="row-gap" style={{ gap: 6, alignItems: 'center' }}>
          <span className="muted" style={{ fontSize: 10 }}>{deal.daysInStage} дн</span>
          {deal.ownerName && (
            <div style={{
              width: 22, height: 22, borderRadius: 999,
              background: 'var(--ink)', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {deal.ownerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Deal modal (create / edit) ────────────────────────────────────

const EMPTY_DEAL_FORM = {
  title: '', companyName: '', contactName: '', contactPhone: '',
  value: 0, stage: 'inquiry', priority: 'normal', hot: false,
  ownerName: '', notes: '',
};

function DealModal({ open, onClose, onSave, initial, onDelete }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initial?: DealDTO;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<any>(EMPTY_DEAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        title: initial.title ?? '',
        companyName: initial.companyName ?? '',
        contactName: initial.contactName ?? '',
        contactPhone: initial.contactPhone ?? '',
        value: initial.value ?? 0,
        stage: initial.stage ?? 'inquiry',
        priority: initial.priority ?? 'normal',
        hot: initial.hot ?? false,
        ownerName: initial.ownerName ?? '',
        notes: initial.notes ?? '',
      } : EMPTY_DEAL_FORM);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.title || !form.companyName) return;
    setSaving(true);
    try { await onSave(form); onClose(); } catch { /* error surfaced via toast */ }
    setSaving(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="deal-modal-title" style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.4)',
      zIndex: 9999, backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <button type="button" onClick={onClose} aria-label="Закрыть сделку" style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }} />
      <div style={{
        position: 'relative',
        width: 540, maxHeight: 'calc(100vh - 40px)', overflow: 'auto',
        background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-3)', padding: 30,
      }}>
        <div className="row between" style={{ marginBottom: 20 }}>
          <div id="deal-modal-title" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
            {initial ? 'Редактировать сделку' : 'Новая сделка'}
          </div>
          {initial && onDelete && (
            <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}>
              <AI.trash /> Удалить
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Название сделки *" value={form.title} onChange={v => setForm((f: any) => ({ ...f, title: v }))} />
          <Field label="Компания *" value={form.companyName} onChange={v => setForm((f: any) => ({ ...f, companyName: v }))} />
          <Field label="Контакт" value={form.contactName} onChange={v => setForm((f: any) => ({ ...f, contactName: v }))} />
          <Field label="Телефон" value={form.contactPhone} onChange={v => setForm((f: any) => ({ ...f, contactPhone: v }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <label htmlFor="deal-value" className="field-label">Сумма (₸)</label>
            <input id="deal-value" type="number" value={form.value} onChange={e => setForm((f: any) => ({ ...f, value: Number(e.target.value) }))}
              style={{ width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }} />
          </div>
          <div>
            <label htmlFor="deal-stage" className="field-label">Этап</label>
            <select id="deal-stage" value={form.stage} onChange={e => setForm((f: any) => ({ ...f, stage: e.target.value }))}
              style={{ width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <option value="inquiry">Заявки</option>
              <option value="qualification">Квалификация</option>
              <option value="quote_sent">КП отправлено</option>
              <option value="approval">Согласование</option>
              <option value="won">Выиграно</option>
              <option value="lost">Проиграно</option>
            </select>
          </div>
        </div>

        <div className="row-gap" style={{ gap: 14, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="deal-owner" className="field-label">Ответственный</label>
            <input id="deal-owner" value={form.ownerName} onChange={e => setForm((f: any) => ({ ...f, ownerName: e.target.value }))} placeholder="Алия К."
              style={{ width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, paddingBottom: 4 }}>
            <label className="row-gap" style={{ gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <input type="checkbox" checked={form.hot} onChange={e => setForm((f: any) => ({ ...f, hot: e.target.checked }))} />
              <span className="pill pill-red" style={{ fontSize: 10 }}><AI.fire /> Горячая</span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label htmlFor="deal-notes" className="field-label">Заметки</label>
          <textarea id="deal-notes" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2}
            style={{ width: '100%', marginTop: 4, padding: '8px 12px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', resize: 'vertical' }} />
        </div>

        <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary">Отмена</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? '…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="field-label" style={{ display: 'block' }}>
      {label}
      <input value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
    </label>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export default function CRMPage() {
  const { pushToast } = useToast();
  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragDeal, setDragDeal] = useState<DealDTO | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DealDTO | null>(null);
  const [deleting, setDeleting] = useState<DealDTO | null>(null);
  const [createStage, setCreateStage] = useState<string>('inquiry');

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPipeline();
      setPipeline(data);
    } catch {
      pushToast('Ошибка загрузки воронки', 'error');
    }
    setLoading(false);
  }, [pushToast]);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  // ── Drag & drop ──────────────────────────────────────────
  const handleDragStart = (deal: DealDTO) => setDragDeal(deal);
  const handleDragEnd = () => { setDragDeal(null); setDragOverCol(null); };

  const handleDrop = async (targetStage: string) => {
    if (!dragDeal) return;
    if (dragDeal.stage === targetStage) { setDragDeal(null); return; }

    // Optimistic update
    setPipeline(prev => prev.map(col => {
      if (col.id === dragDeal.stage) {
        return { ...col, deals: col.deals.filter(d => d.id !== dragDeal.id), wip: col.wip - 1, sum: col.sum - dragDeal.value };
      }
      if (col.id === targetStage) {
        const moved = { ...dragDeal, stage: targetStage, daysInStage: 0 };
        return { ...col, deals: [moved, ...col.deals], wip: col.wip + 1, sum: col.sum + dragDeal.value };
      }
      return col;
    }));
    setDragDeal(null);
    setDragOverCol(null);

    try {
      await updateDeal(dragDeal.id, { stage: targetStage });
      pushToast(`${dragDeal.dealNumber} → ${targetStage}`, 'success');
      fetchPipeline(); // refresh to get server-side daysInStage
    } catch {
      pushToast('Ошибка перемещения', 'error');
      fetchPipeline();
    }
  };

  // ── Save (create or update) ──────────────────────────────
  const handleSave = async (data: any) => {
    if (editing) {
      await updateDeal(editing.id, data);
      pushToast('Сделка обновлена', 'success');
    } else {
      await createDeal(data);
      pushToast('Сделка создана', 'success');
    }
    setEditing(null);
    fetchPipeline();
  };

  const openCreate = (stage: string) => {
    setEditing(null);
    setCreateStage(stage);
    setModalOpen(true);
  };

  const openEdit = (deal: DealDTO) => {
    setEditing(deal);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDeal(deleting.id);
      pushToast('Сделка удалена', 'success');
      setDeleting(null);
      fetchPipeline();
    } catch {
      pushToast('Ошибка удаления', 'error');
    }
  };

  // ── Totals ───────────────────────────────────────────────
  const totalDeals = pipeline.reduce((s, c) => s + c.wip, 0);
  const totalValue = pipeline.reduce((s, c) => s + c.sum, 0);

  if (loading) {
    return <div className="page"><div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>Загрузка воронки…</div></div>;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Воронка продаж</div>
          <div className="page-sub">
            {totalDeals} сделок · потенциал {fmtTng(totalValue)} ₸
          </div>
        </div>
        <div className="row-gap" style={{ gap: 8 }}>
          <button onClick={() => openCreate('inquiry')} className="btn btn-primary">
            <AI.plus /> Новая сделка
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14,
        overflow: 'auto', paddingBottom: 60,
      }}>
        {pipeline.map((col, colIdx) => (
          <div
            key={col.id}
            onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col.id)}
            style={{
              background: 'var(--surface-2)', borderRadius: 12,
              border: dragOverCol === col.id && dragDeal?.stage !== col.id
                ? '2px dashed var(--red-hair)' : '2px solid transparent',
              padding: 12, minHeight: 200,
              transition: 'border-color .15s',
            }}
          >
            {/* Column header */}
            <div className="row between" style={{ padding: '0 4px 10px' }}>
              <div className="row-gap" style={{ gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: STAGE_COLORS[colIdx],
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{col.label}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: 'var(--surface)', borderRadius: 999,
                  padding: '2px 8px', color: 'var(--ink-3)',
                }}>{col.wip}</span>
              </div>
            </div>
            <div className="mono muted" style={{ fontSize: 10, padding: '0 4px 8px', fontWeight: 600 }}>
              ИТОГО · {fmtTng(col.sum)} ₸
            </div>

            {/* Deal cards */}
            {col.deals.map((deal, i) => (
              <KanbanCard
                key={deal.id}
                deal={deal}
                idx={i}
                onEdit={openEdit}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}

            {/* Add deal button */}
            <button
              onClick={() => openCreate(col.id)}
              style={{
                width: '100%', marginTop: 4, padding: '10px 12px',
                background: 'transparent', border: '1.5px dashed var(--border-strong)',
                borderRadius: 8, color: 'var(--ink-3)', fontSize: 12, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
            >
              <AI.plus /> Добавить
            </button>
          </div>
        ))}
      </div>

      {/* Deal modal */}
      <DealModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={(data) => handleSave(editing ? data : { ...data, stage: createStage })}
        initial={editing ?? undefined}
        onDelete={editing ? () => { setDeleting(editing); setModalOpen(false); } : undefined}
      />

      {/* Delete confirm */}
      {deleting && (
        <ConfirmModal
          title="Удалить сделку?"
          message={`Сделка ${deleting.dealNumber} «${deleting.title}» будет удалена безвозвратно.`}
          confirmLabel="Удалить"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
