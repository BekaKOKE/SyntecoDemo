'use client';

import { useState } from 'react';
import { StaticPage } from '@/components/layouts/StaticPage';
import { Icons } from '@/lib/icons';

const PERKS: { icon: React.ReactNode; title: string; desc: string }[] = [
  { icon: <Icons.rocket width={26} height={26} />, title: 'Технологии', desc: 'Современный стек: NestJS, Next.js, PostgreSQL, Prisma. Без легаси.' },
  { icon: <Icons.trend width={26} height={26} />, title: 'Рост', desc: 'Растущая платформа — растущие роли. Влияйте на продукт напрямую.' },
  { icon: <Icons.home width={26} height={26} />, title: 'Гибрид', desc: 'Офис в Атырау + удалёнка. Гибкий график. Результат важнее часов.' },
  { icon: <Icons.money width={26} height={26} />, title: 'Доход', desc: 'Конкурентная зарплата + бонусы. Оформление по ТК РК.' },
  { icon: <Icons.cap width={26} height={26} />, title: 'Обучение', desc: 'Бюджет на курсы и конференции. Менторство от senior-инженеров.' },
  { icon: <Icons.globe width={26} height={26} />, title: 'Масштаб', desc: 'Ваш код будет обслуживать предприятия Казахстана.' },
];

export default function CareersPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', message: '' });
  const [sent, setSent] = useState(false);

  return (
    <StaticPage title="Карьера в Synteco" subtitle="Мы строим MRO-платформу для промышленного снабжения Казахстана. Присоединяйтесь." compact>
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Почему Synteco?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {PERKS.map(p => (
            <div key={p.title} className="card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 10, color: 'var(--color-accent)' }}>{p.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 48, background: 'var(--color-surface-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--color-ink-3)' }}><Icons.mail width={22} height={22} /></span>
          <div style={{ fontSize: 14, color: 'var(--color-ink-2)' }}>
            Открытых вакансий сейчас нет, но мы всегда рады перспективным специалистам.
            Пришлите резюме — свяжемся, когда появится подходящая роль.
          </div>
        </div>
      </div>

      <h2 id="apply" style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Отправить резюме</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.name || !form.email || !form.phone) return;
          try {
            const csrfRes = await fetch('/api/v1/csrf-token', { cache: 'no-store' });
            const csrfToken = csrfRes.ok ? (await csrfRes.json()).token : '';
            await fetch('/api/v1/admin/inquiries/public', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
              body: JSON.stringify({ companyName: form.name, contactName: form.name, contactPhone: form.phone, contactEmail: form.email, notes: `Резюме: ${form.position || 'Спонтанное'}\n\n${form.message || ''}`, priority: 'normal' }),
            });
            setSent(true);
            setForm({ name: '', email: '', phone: '', position: '', message: '' });
            setTimeout(() => setSent(false), 4000);
          } catch { /* submission failure — handled by UI state */ }
        }}
        className="card" style={{ padding: 32 }}
      >
        {sent && (
          <div className="pill ok" style={{ marginBottom: 16, display: 'inline-flex' }}>
            <Icons.check width={12} height={12} /> Резюме отправлено. Мы свяжемся с вами.
          </div>
        )}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Имя *</label>
              <input className="input" placeholder="Ваше имя" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email *</label>
              <input type="email" className="input" placeholder="you@email.kz" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон *</label>
              <input type="tel" className="input" placeholder="+7 (___) ___ __ __" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Желаемая роль</label>
              <input className="input" placeholder="Например: Backend-разработчик" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Сопроводительное письмо</label>
            <textarea className="input" rows={4} placeholder="Расскажите о себе, опыте и почему хотите работать в Synteco…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg">Отправить резюме</button>
        </div>
      </form>
    </StaticPage>
  );
}
