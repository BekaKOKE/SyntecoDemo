'use client';

import { StaticPage } from '@/components/layouts/StaticPage';
import { Icons } from '@/lib/icons';

// NOTE: Only the Atyrau branch is real. Other cities will be added as branches open.
const BRANCHES = [
  { city: 'Атырау', type: 'Офис и склад', addr: 'Проспект Азаттық, д. 2', phone: '+7 702 475 17 03', email: 'j.tolegenova@synteco.kz', hours: 'Пн–Пт 09:00–18:00' },
];

export default function BranchesPage() {
  return (
    <StaticPage title="Филиалы" subtitle="Наш офис и склад в Атырау. Доставка по всему Казахстану." compact>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {BRANCHES.map(b => (
          <div key={b.city} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{b.city}</h3>
              <span className="pill" style={{ fontSize: 10 }}>{b.type}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.65 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icons.mapPin width={14} height={14} /> <span>{b.addr}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                <Icons.phone width={14} height={14} /> <a href={`tel:${b.phone.replace(/\s/g, '')}`} style={{ color: 'inherit' }}>{b.phone}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-3)' }}>
                <Icons.mail width={14} height={14} /> <span>{b.email}</span>
              </div>
              <div className="hairt" style={{ marginTop: 12, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-ink-4)' }}>
                <Icons.clock width={14} height={14} /> <span>{b.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Как добраться</h3>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-hair)' }}>
          <iframe
            src="https://yandex.ru/map-widget/v1/?ll=51.923342%2C47.111080&z=16&pt=51.923342,47.111080,pm2rdl"
            width="100%"
            height="400"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 16, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icons.truck width={22} height={22} />
        <div style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>
          Доставка в другие города Казахстана — курьерскими службами. Сроки и стоимость уточняйте у менеджера.
        </div>
      </div>
    </StaticPage>
  );
}
