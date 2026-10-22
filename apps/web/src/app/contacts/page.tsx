'use client';

import { useState } from 'react';
import { StaticPage } from '@/components/layouts/StaticPage';
import Link from 'next/link';
import { PhoneInput } from '@/components/molecules/PhoneInput';
import { Icons } from '@/lib/icons';
import { submitPublicInquiry } from '@/lib/api/inquiries';

const SIDEBAR = [
  { label: 'Контакты', href: '/contacts' },
  { label: 'Филиалы', href: '/branches' },
  { label: 'О компании', href: '/about' },
  { label: 'Обратная связь', href: '/feedback' },
];

const CONTACT_CHANNELS: { icon: React.ReactNode; title: string; value: string; sub: string }[] = [
  { icon: <Icons.phone width={20} height={20} />, title: 'Телефон', value: '+7 702 475 17 03', sub: 'Звонки и консультации' },
  { icon: <Icons.mail width={20} height={20} />, title: 'Email', value: 'j.tolegenova@synteco.kz', sub: 'Для общих запросов' },
  { icon: <Icons.chat width={20} height={20} />, title: 'WhatsApp', value: '+7 702 475 17 03', sub: 'Быстрые вопросы' },
  { icon: <Icons.clock width={20} height={20} />, title: 'Режим работы', value: 'Пн–Пт, 09:00–18:00', sub: 'Атырау, UTC+5' },
];

export default function ContactsPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', topic: 'general', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return;
    setSending(true);
    setError('');
    try {
      await submitPublicInquiry({
        companyName: form.name,
        contactName: form.name,
        contactPhone: form.phone,
        contactEmail: form.email,
        priority: form.topic === 'urgent' ? 'high' : 'normal',
        notes: `Тема: ${form.topic}\n\n${form.message || 'Заявка со страницы контактов'}`,
      });
      setSent(true);
      setForm({ name: '', phone: '', email: '', topic: 'general', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError('Ошибка отправки. Позвоните нам: +7 702 475 17 03');
    } finally {
      setSending(false);
    }
  };

  return (
    <StaticPage
      title="Контакты"
      subtitle="Свяжитесь с нами любым удобным способом. Мы отвечаем в рабочее время."
      sidebar={SIDEBAR}
      sidebarTitle="Компания"
    >
      {/* ── Main contacts grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
        {CONTACT_CHANNELS.map(c => {
          const isWhatsApp = c.title === 'WhatsApp';
          const cardContent = (
            <div className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'start', cursor: isWhatsApp ? 'pointer' : 'default', transition: 'box-shadow 0.15s', textDecoration: 'none', color: 'inherit', height: '100%' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-3)', fontWeight: 500, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-4)', marginTop: 4 }}>{c.sub}</div>
              </div>
            </div>
          );
          return isWhatsApp ? (
            <a key={c.title} href={`https://wa.me/77024751703?text=${encodeURIComponent('Здравствуйте! Хочу узнать о наличии и ценах на товары Synteco')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              {cardContent}
            </a>
          ) : (
            <div key={c.title}>{cardContent}</div>
          );
        })}
      </div>

      {/* ── Office ── */}
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, letterSpacing: '-0.02em' }}>Офис и склад</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 48 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Атырау</h3>
              <span className="pill" style={{ fontSize: 10 }}>Офис и склад</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Icons.mapPin width={14} height={14} /> Казахстан, город Атырау, Проспект Азаттық, д. 2
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <Icons.phone width={14} height={14} /> +7 702 475 17 03
            </div>
            <div className="muted" style={{ marginTop: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.clock width={14} height={14} /> Пн–Пт: 09:00–18:00
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 48 }}>
        <Link href="/branches" className="btn btn-secondary">Филиалы <Icons.arrow /></Link>
      </div>

      {/* ── Contact form ── */}
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, letterSpacing: '-0.02em' }}>Напишите нам</h2>
      <form onSubmit={submit} className="card" style={{ padding: 32 }}>
        {sent && (
          <div className="pill ok" style={{ marginBottom: 16, fontSize: 13, padding: '10px 16px', display: 'inline-flex' }}>
            <Icons.check width={12} height={12} /> Заявка отправлена. Мы свяжемся с вами в ближайшее время.
          </div>
        )}
        {error && (
          <div className="pill warn" style={{ marginBottom: 16, fontSize: 13, padding: '10px 16px' }}>{error}</div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Ваше имя *</label>
              <input name="name" className="input" placeholder="Ваше имя" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон *</label>
              <PhoneInput name="phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email *</label>
            <input name="email" type="email" className="input" placeholder="you@company.kz" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Тема</label>
            <select name="topic" className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} style={{ fontFamily: 'var(--font-sans)' }}>
              <option value="general">Общий вопрос</option>
              <option value="quote">Запрос коммерческого предложения</option>
              <option value="partnership">Партнёрство / поставщикам</option>
              <option value="complaint">Жалоба или предложение</option>
              <option value="urgent">Срочный вопрос</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Сообщение</label>
            <textarea name="message" className="input" rows={4} placeholder="Опишите ваш вопрос…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
            {sending ? 'Отправка…' : 'Отправить сообщение'} {!sending && <Icons.arrow />}
          </button>
          <p className="muted" style={{ fontSize: 11, textAlign: 'center' }}>
            Нажимая кнопку, вы соглашаетесь с <Link href="/privacy" style={{ color: 'var(--color-accent)' }}>политикой конфиденциальности</Link>.
          </p>
        </div>
      </form>
    </StaticPage>
  );
}
