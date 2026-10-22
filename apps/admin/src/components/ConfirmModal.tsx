'use client';

import { AI } from '@/lib/icons';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title, message, confirmLabel = 'Удалить', danger = true, loading = false,
  onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.35)',
      zIndex: 9999, backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Закрыть окно подтверждения"
        style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }}
      />
      <div style={{
        position: 'relative',
        width: 420,
        background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-3)', padding: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: danger ? 'var(--red-light)' : 'var(--warn-light)',
            color: danger ? 'var(--red)' : 'var(--warn)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AI.trash style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div id="confirm-modal-title" style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{title}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{message}</div>
          </div>
        </div>

        <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Отмена</button>
          <button onClick={onConfirm} className={danger ? 'btn btn-primary' : 'btn btn-dark'} disabled={loading}
            style={danger ? { background: 'var(--red)', borderColor: 'var(--red)' } : {}}>
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
