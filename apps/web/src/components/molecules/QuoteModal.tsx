'use client';

import { useState, useEffect } from 'react';
import { PhoneInput } from '@/components/molecules/PhoneInput';
import { Icons } from '@/lib/icons';

interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  /** Product context — what the customer is asking a quote for */
  product: {
    variantId: string;
    title: string;
    brandName?: string;
  };
  qty: number;
  unitPrice: number;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Modal form to request a commercial quote (КП) for a single product.
 * Submits to /admin/inquiries/public (CSRF-protected) with the product prefilled
 * as an inquiry item — the same flow as checkout, the manager then calls back.
 */
export function QuoteModal({ open, onClose, product, qty, unitPrice }: QuoteModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset on open
  useEffect(() => {
    if (open) {
      setStatus('idle');
      setErrorMsg('');
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Lock body scroll while modal open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorMsg('Укажите ваше имя'); return; }
    if (!phone.trim()) { setErrorMsg('Укажите телефон для связи'); return; }
    if (!email.trim()) { setErrorMsg('Укажите email для связи'); return; }

    setStatus('loading');
    setErrorMsg('');
    try {
      // Fetch CSRF token (endpoint is @CsrfRequired)
      let csrfToken = '';
      try {
        const csrfRes = await fetch('/api/v1/csrf-token');
        if (csrfRes.ok) csrfToken = (await csrfRes.json()).token;
      } catch { /* proceed; server may allow without */ }

      const notes = `Запрос КП с карточки товара\n${product.brandName ? `Бренд: ${product.brandName}\n` : ''}Товар: ${product.title}\nАртикул: ${product.variantId}\nКоличество: ${qty} шт${comment.trim() ? `\n\nКомментарий: ${comment.trim()}` : ''}`;

      const res = await fetch('/api/v1/admin/inquiries/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          companyName: name.trim(),
          contactName: name.trim(),
          contactPhone: phone.trim(),
          contactEmail: email.trim(),
          priority: 'normal',
          notes,
          items: [{ sku: product.variantId, name: product.brandName ? `${product.brandName} - ${product.title}` : product.title, quantity: qty, unitPrice }],
        }),
      });

      if (!res.ok) throw new Error('Не удалось отправить заявку');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message ?? 'Ошибка отправки заявки');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(11, 12, 14, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        className="card"
        style={{
          width: '100%', maxWidth: 460, padding: 0, overflow: 'hidden',
          boxShadow: 'var(--shadow-3)',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hair)' }}>
          <div>
            <div id="quote-modal-title" style={{ fontSize: 18, fontWeight: 600 }}>Запрос коммерческого предложения</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4, maxWidth: 320, lineHeight: 1.4 }}>
              {product.title.length > 60 ? product.title.slice(0, 60) + '…' : product.title}
              <span className="mono" style={{ marginLeft: 6 }}>· {product.variantId}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Закрыть" style={{ flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, color: 'var(--color-ink-3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        {status === 'success' ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--color-ok-soft)', color: 'var(--color-ok)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.check width={28} height={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Заявка отправлена</h3>
            <p className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              Наш менеджер свяжется с вами для уточнения наличия, сроков и финальной цены.
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: 20 }}>Закрыть</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding: '20px 24px 24px', display: 'grid', gap: 14, overflowY: 'auto' }}>
            <div>
              <label htmlFor="qm-name" style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Ваше имя</label>
              <input id="qm-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" required style={{ width: '100%' }} />
            </div>
            <div>
              <label htmlFor="qm-phone" style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон *</label>
              <PhoneInput id="qm-phone" value={phone} onChange={setPhone} required />
            </div>
            <div>
              <label htmlFor="qm-email" style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email *</label>
              <input id="qm-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.kz" required style={{ width: '100%' }} />
            </div>
            <div>
              <label htmlFor="qm-comment" style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Комментарий <span className="muted">(необязательно)</span></label>
              <textarea id="qm-comment" className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Количество, сроки, особые требования…" style={{ width: '100%', resize: 'vertical', height: 'auto', padding: '10px 14px', fontFamily: 'inherit' }} />
            </div>

            {errorMsg && (
              <div className="pill warn" style={{ display: 'inline-flex' }}>{errorMsg}</div>
            )}

            <button type="submit" disabled={status === 'loading'} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 4 }}>
              {status === 'loading' ? 'Отправка…' : <>Отправить заявку <Icons.arrow /></>}
            </button>
            <p className="muted" style={{ fontSize: 11, lineHeight: 1.5, textAlign: 'center' }}>
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
