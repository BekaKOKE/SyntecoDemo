'use client';

import { useState } from 'react';
import { StaticPage } from '@/components/layouts/StaticPage';
import { Icons } from '@/lib/icons';

const CHANNELS: { icon: React.ReactNode; value: string; sub: string }[] = [
  { icon: <Icons.phone width={24} height={24} />, value: '+7 702 475 17 03', sub: 'Звонки, Пн–Пт 09:00–18:00' },
  { icon: <Icons.chat width={24} height={24} />, value: '+7 702 475 17 03', sub: 'WhatsApp, быстрые вопросы' },
  { icon: <Icons.mail width={24} height={24} />, value: 'j.tolegenova@synteco.kz', sub: 'Для общих запросов' },
  { icon: <Icons.clock width={24} height={24} />, value: 'Пн–Пт, 09:00–18:00', sub: 'Атырау, UTC+5' },
];

export default function FeedbackPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  return (
    <StaticPage title="Обратная связь" subtitle="Ваше мнение помогает нам становиться лучше. Вопросы, предложения, жалобы — мы отвечаем в рабочее время." compact>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        {CHANNELS.map(c => (
          <div key={c.value + c.sub} className="card" style={{ padding: 24, display: 'flex', gap: 14, alignItems: 'start' }}>
            <div style={{ color: 'var(--color-accent)' }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{c.value}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSending(true);
          const f = e.currentTarget;
          try {
            const csrfRes = await fetch('/api/v1/csrf-token', { cache: 'no-store' });
            const csrfToken = csrfRes.ok ? (await csrfRes.json()).token : '';
            await fetch('/api/v1/admin/inquiries/public', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
              body: JSON.stringify({
                companyName: (f.elements.namedItem('name') as HTMLInputElement)?.value,
                contactName: (f.elements.namedItem('name') as HTMLInputElement)?.value,
                contactPhone: (f.elements.namedItem('phone') as HTMLInputElement)?.value,
                contactEmail: (f.elements.namedItem('email') as HTMLInputElement)?.value,
                priority: (f.elements.namedItem('topic') as HTMLSelectElement)?.value === 'complaint' ? 'high' : 'normal',
                notes: `Тема: ${(f.elements.namedItem('topic') as HTMLSelectElement)?.value}\n\n${(f.elements.namedItem('message') as HTMLTextAreaElement)?.value}`,
              }),
            });
            setSent(true); f.reset();
          } catch { /* submission failure — handled by UI state */ } finally { setSending(false); }
        }}
        className="card" style={{ padding: 32 }}
      >
        {sent && (
          <div className="pill ok" style={{ marginBottom: 16, fontSize: 13, display: 'inline-flex' }}>
            <Icons.check width={12} height={12} /> Сообщение отправлено. Мы ответим в ближайшее время.
          </div>
        )}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Имя *</label>
              <input name="name" className="input" placeholder="Ваше имя" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email *</label>
              <input name="email" type="email" className="input" placeholder="you@company.kz" required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон *</label>
            <input name="phone" type="tel" className="input" placeholder="+7 (___) ___ __ __" required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Тема</label>
            <select name="topic" className="input" style={{ fontFamily: 'var(--font-sans)' }}>
              <option value="general">Общий вопрос</option>
              <option value="suggestion">Предложение по улучшению</option>
              <option value="quality">Качество товара или услуги</option>
              <option value="complaint">Жалоба</option>
              <option value="partnership">Партнёрство</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Сообщение *</label>
            <textarea name="message" className="input" rows={5} placeholder="Опишите ваш вопрос или предложение…" required style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>{sending ? 'Отправка…' : 'Отправить'}</button>
        </div>
      </form>
    </StaticPage>
  );
}
