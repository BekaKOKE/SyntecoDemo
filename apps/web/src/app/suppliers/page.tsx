'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { StaticPage } from '@/components/layouts/StaticPage';
import { Icons } from '@/lib/icons';

const PERKS: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <Icons.trend width={26} height={26} />, title: 'Рынок', desc: 'Доступ к B2B-заказчикам: нефтегаз, строительство, энергетика, промышленность.' },
  { icon: <Icons.bolt width={26} height={26} />, title: 'Скорость', desc: 'Размещение каталога в короткие сроки. Помогаем с нормализацией данных.' },
  { icon: <Icons.chart width={26} height={26} />, title: 'Аналитика', desc: 'Отчёт по просмотрам и запросам вашей продукции.' },
  { icon: <Icons.money width={26} height={26} />, title: 'Экономия', desc: 'Не нужно содержать отдельный отдел продаж и маркетинга.' },
  { icon: <Icons.handshake width={26} height={26} />, title: 'Логистика', desc: 'Склад в Атырау и доставка по Казахстану курьерскими службами.' },
  { icon: <Icons.shield width={26} height={26} />, title: 'Доверие', desc: 'Прозрачные условия партнёрства, оформление по ТК РК.' },
];

export default function SuppliersPage() {
  const [sent, setSent] = useState(false);

  return (
    <StaticPage title="Поставщикам" subtitle="Разместите вашу продукцию на B2B MRO-платформе Synteco. Расскажите о своём каталоге — обсудим формат сотрудничества." compact>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Почему Synteco?</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 48 }}>
        {PERKS.map(p => (
          <div key={p.title} className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 10, color: 'var(--color-accent)' }}>{p.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.5 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Как мы работаем с поставщиками</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
        {[
          ['01', 'Заявка', 'Заполните форму ниже или позвоните. Расскажите о вашей продукции и текущих клиентах.'],
          ['02', 'Аудит', 'Анализируем каталог: соответствие рынку Казахстана, конкурентность цен, логистику.'],
          ['03', 'Договор', 'Подписываем партнёрский договор. Фиксируем условия: комиссия, логистика, возвраты.'],
          ['04', 'Интеграция', 'Загружаем каталог на платформу, нормализуем данные и техспецификации.'],
          ['05', 'Запуск', 'Ваша продукция доступна заказчикам. Начинаем получать заявки.'],
        ].map(([n, t, d]) => (
          <div key={n} className="card" style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-ink)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{n}</div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.5, margin: 0 }}>{d}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 id="form" style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Стать поставщиком</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem('company') as HTMLInputElement)?.value?.trim();
          const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value?.trim();
          const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
          if (!name || !phone || !email) return;
          try {
            const csrfRes = await fetch('/api/v1/csrf-token', { cache: 'no-store' });
            const csrfToken = csrfRes.ok ? (await csrfRes.json()).token : '';
            await fetch('/api/v1/admin/inquiries/public', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
              body: JSON.stringify({ companyName: name, contactName: name, contactPhone: phone, contactEmail: email, priority: 'normal', notes: `Заявка от поставщика. Продукция: ${(form.elements.namedItem('products') as HTMLTextAreaElement)?.value || ''}` }),
            });
            setSent(true);
            form.reset();
            setTimeout(() => setSent(false), 4000);
          } catch { /* submission failure — handled by UI state */ }
        }}
        className="card" style={{ padding: 32 }}
      >
        {sent && (
          <div className="pill ok" style={{ marginBottom: 16, fontSize: 13, display: 'inline-flex' }}>
            <Icons.check width={12} height={12} /> Заявка отправлена. Мы свяжемся с вами.
          </div>
        )}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Компания *</label>
              <input name="company" className="input" placeholder="Название компании" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Контактное лицо *</label>
              <input name="contact" className="input" placeholder="ФИО" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон *</label>
              <input name="phone" type="tel" className="input" placeholder="+7 (___) ___ __ __" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email *</label>
              <input name="email" type="email" className="input" placeholder="info@company.kz" required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Описание продукции</label>
            <textarea name="products" className="input" rows={4} placeholder="Опишите вашу продукцию: категории, бренды, ориентировочное количество SKU…" style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg">Отправить заявку</button>
        </div>
      </form>
    </StaticPage>
  );
}
