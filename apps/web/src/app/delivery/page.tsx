'use client';

import { StaticPage } from '@/components/layouts/StaticPage';
import { Icons } from '@/lib/icons';

const SIDEBAR = [
  { label: 'Доставка', href: '/delivery' },
  { label: 'Оплата', href: '/help#payment' },
  { label: 'Возврат', href: '/returns' },
  { label: 'Гарантия', href: '/help#warranty' },
  { label: 'Помощь', href: '/help' },
  { label: 'Контакты', href: '/contacts' },
];

const OPTIONS: { icon: React.ReactNode; title: string; desc: string }[] = [
  { icon: <Icons.mapPin width={26} height={26} />, title: 'Самовывоз из Атырау', desc: 'Заберите заказ со склада в Атырау (Проспект Азаттық, д. 2) после подтверждения менеджером. Без дополнительной платы.' },
  { icon: <Icons.truck width={26} height={26} />, title: 'Доставка по Казахстану', desc: 'Отправляем курьерскими службами по всему Казахстану. Стоимость и сроки зависят от региона и габаритов груза — рассчитывается при подтверждении заказа.' },
  { icon: <Icons.chat width={26} height={26} />, title: 'Согласование деталей', desc: 'Менеджер уточнит наличие, итоговую цену, способ доставки и удобное время после оформления заявки.' },
];

export default function DeliveryPage() {
  return (
    <StaticPage title="Доставка" subtitle="Самовывоз из Атырау и доставка курьерскими службами по Казахстану. Точные условия — при подтверждении заказа." sidebar={SIDEBAR} sidebarTitle="Покупателям">
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em' }}>Способы получения заказа</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 40 }}>
        {OPTIONS.map(o => (
          <div key={o.title} className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 12, color: 'var(--color-accent)' }}>{o.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{o.title}</h3>
            <div style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.55 }}>{o.desc}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 28, background: 'var(--color-surface-2)', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 14 }}>
          <span style={{ color: 'var(--color-ink-3)', marginTop: 2 }}><Icons.phone width={22} height={22} /></span>
          <p style={{ fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.6, margin: 0 }}>
            Стоимость и сроки доставки не входят в стоимость товара на сайте и рассчитываются индивидуально.
            Уточните детали у менеджера: <a href="tel:+77024751703" style={{ color: 'var(--color-accent)' }}>+7 702 475 17 03</a>.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em' }}>Часто задаваемые вопросы</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {[
          ['Как узнать статус заказа?', 'Статус можно уточнить в личном кабинете или у менеджера по телефону.'],
          ['Что делать если заказ не пришёл вовремя?', 'Свяжитесь с менеджером по телефону +7 702 475 17 03 — разберёмся.'],
          ['Можно ли изменить адрес доставки после оформления?', 'Да, если заказ ещё не отправлен. Свяжитесь с менеджером.'],
          ['Доставляете ли вы за пределы Казахстана?', 'Возможна доставка в страны ЕАЭС. Условия обсуждаются индивидуально.'],
        ].map(([q, a]) => (
          <details key={q} className="card" style={{ padding: 0 }}>
            <summary style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {q}
              <span style={{ fontSize: 18, color: 'var(--color-ink-4)' }}>+</span>
            </summary>
            <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.6 }}>{a}</div>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}
