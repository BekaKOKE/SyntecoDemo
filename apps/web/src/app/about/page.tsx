'use client';

import { StaticPage } from '@/components/layouts/StaticPage';
import Link from 'next/link';
import { Icons } from '@/lib/icons';

const SIDEBAR = [
  { label: 'О компании', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Карьера', href: '/careers' },
  { label: 'Поставщикам', href: '/suppliers' },
];

const VALUES = [
  { code: '01', title: 'Точность', desc: 'Верифицированные артикулы и характеристики. Менеджер проверяет наличие и совместимость до отгрузки.' },
  { code: '02', title: 'Скорость', desc: 'Обработка заявок в рабочее время. Доставка по Казахстану курьерскими службами.' },
  { code: '03', title: 'Прозрачность', desc: 'Цены с НДС. Понятные условия. Полная история заказов и документов в личном кабинете.' },
  { code: '04', title: 'Партнёрство', desc: 'Персональный менеджер, контрактные цены и пакет документов для юрлиц.' },
];

export default function AboutPage() {
  return (
    <StaticPage
      title="О компании Synteco"
      subtitle="Synteco — B2B-платформа промышленного снабжения (MRO) в Казахстане. Каталог, подбор аналогов и доставка промышленных товаров для предприятий."
      sidebar={SIDEBAR}
      sidebarTitle="Компания"
    >
      {/* ── Company Story ── */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>О нас</h2>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
          <p style={{ marginBottom: 14 }}>
            Synteco — казахстанская платформа промышленного снабжения. Мы объединяем каталог MRO-товаров,
            подбор аналогов и доставку по Казахстану в одном сервисе.
          </p>
          <p style={{ marginBottom: 14 }}>
            Наш офис и склад находятся в Атырау. Мы работаем с юридическими лицами: предоставляем пакет
            документов, цены с НДС и персонального менеджера для постоянных клиентов.
          </p>
          <p>
            Каталог постоянно пополняется. Если нужной позиции нет на сайте — оставьте заявку, и менеджер
            найдёт артикул или подберёт аналог.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>Принципы работы</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {VALUES.map(v => (
            <div key={v.code} className="card" style={{ padding: 28 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.08em' }}>{v.code}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>{v.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.55 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact person ── */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>Контакт</h2>
        <div className="card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'start', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'var(--color-accent)',
            flexShrink: 0,
          }}>
            ЖТ
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Жасмин Толегенова</h3>
            <div style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 500, marginBottom: 8 }}>Менеджер по работе с клиентами</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--color-ink-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.phone width={14} height={14} />
                <a href="tel:+77024751703" style={{ color: 'inherit' }}>+7 702 475 17 03</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.mail width={14} height={14} />
                <a href="mailto:j.tolegenova@synteco.kz" style={{ color: 'inherit' }}>j.tolegenova@synteco.kz</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.mapPin width={14} height={14} />
                Казахстан, город Атырау, Проспект Азаттық, д. 2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>Как нас найти</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--color-hair)' }}>
            <span style={{ color: 'var(--color-accent)' }}><Icons.mapPin width={18} height={18} /></span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>Офис и склад · Атырау</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>Проспект Азаттық, д. 2 · Пн–Пт 09:00–18:00</div>
            </div>
          </div>
          <iframe
            src="https://yandex.ru/map-widget/v1/?ll=51.923342%2C47.111080&z=16&pt=51.923342,47.111080,pm2rdl"
            width="100%"
            height="360"
            frameBorder="0"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
          />
        </div>
      </section>

      {/* ── Certifications (products) ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>Сертификаты на товары</h2>
        <div className="card" style={{ padding: 28, background: 'var(--color-surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: 14 }}>
            <span style={{ color: 'var(--color-ink-3)', marginTop: 2 }}><Icons.doc width={22} height={22} /></span>
            <p style={{ fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.6, margin: 0 }}>
              Сертификаты соответствия, декларации, паспорта качества и другая документация на товары
              предоставляются по запросу. Уточните наличие у менеджера при оформлении заказа.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="card" style={{ padding: 32, background: 'var(--color-ink)', color: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-bg)', letterSpacing: '-0.02em' }}>Стать клиентом Synteco</h2>
            <p style={{ fontSize: 14, color: 'var(--color-ink-3)', marginTop: 6 }}>Зарегистрируйтесь или свяжитесь с менеджером для обсуждения условий.</p>
          </div>
          <Link href="/contacts" className="btn btn-primary btn-lg">
            Связаться с нами <Icons.arrow />
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
