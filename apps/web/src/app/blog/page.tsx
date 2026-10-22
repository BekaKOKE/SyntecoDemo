'use client';

import Link from 'next/link';
import { StaticPage } from '@/components/layouts/StaticPage';
import { Icons } from '@/lib/icons';

const SIDEBAR = [
  { label: 'Новости', href: '/blog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'Каталог', href: '/products' },
  { label: 'Контакты', href: '/contacts' },
];

const NEWS = [
  {
    date: '2026',
    tag: 'Официальные бренды',
    title: 'Synteco развивает направление официальной дистрибуции',
    text: 'На сайте собраны ключевые бренды для промышленной безопасности, СИЗ, LOTO и пожарного оборудования: Honeywell, PIP Global, 3M, Master Lock, Ansul и Uvex.',
    href: '/brands',
  },
  {
    date: '2026',
    tag: 'Каталог',
    title: 'Каталог товаров адаптирован под быстрый B2B-подбор',
    text: 'Карточки, категории и поиск помогают быстрее найти нужные позиции, запросить аналоги и отправить заявку менеджеру Synteco.',
    href: '/products',
  },
  {
    date: '2026',
    tag: 'Сервис',
    title: 'Запрос КП и каталога переведен в один понятный сценарий',
    text: 'Для закупщиков и инженеров теперь проще оставить заявку, указать потребность и получить коммерческое предложение или официальный каталог.',
    href: '/contacts',
  },
];

export default function BlogPage() {
  return (
    <StaticPage
      title="Новости Synteco"
      subtitle="Обновления компании, официальные бренды, каталог и B2B-сервис для промышленных закупок."
      sidebar={SIDEBAR}
      sidebarTitle="Разделы"
    >
      <section style={{ marginBottom: 28 }}>
        <div
          className="card"
          style={{
            padding: 28,
            background:
              'linear-gradient(135deg, var(--color-ink) 0%, #2a0d0d 58%, var(--color-accent-press) 100%)',
            color: 'var(--color-bg)',
            overflow: 'hidden',
          }}
        >
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.62)' }}>Synteco news</div>
          <h2 style={{ marginTop: 10, color: 'var(--color-bg)', maxWidth: 620 }}>
            Новости, которые помогают закупкам работать быстрее
          </h2>
          <p style={{ marginTop: 12, maxWidth: 650, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6 }}>
            Здесь будут появляться обновления по брендам, поставкам, каталогу и сервисам для корпоративных клиентов.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
            <Link href="/contacts" className="btn btn-primary">
              Запросить КП <Icons.arrow />
            </Link>
            <Link href="/brands" className="btn btn-secondary">
              Официальные бренды
            </Link>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
        {NEWS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="card card-hover news-list-card"
            style={{
              display: 'grid',
              gridTemplateColumns: '94px minmax(0, 1fr) auto',
              gap: 18,
              alignItems: 'center',
              padding: 22,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              className="mono"
              style={{
                borderRight: '1px solid var(--color-hair)',
                color: 'var(--color-accent)',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {item.date}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ color: 'var(--color-accent)', marginBottom: 7 }}>{item.tag}</div>
              <h3 style={{ fontSize: 18 }}>{item.title}</h3>
              <p style={{ marginTop: 7, color: 'var(--color-ink-3)', lineHeight: 1.55 }}>{item.text}</p>
            </div>
            <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}>
              <Icons.arrow />
            </span>
          </Link>
        ))}
      </section>

      <section
        className="card"
        style={{
          padding: 26,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: 22 }}>Нужна новость о конкретном бренде или поставке?</h2>
          <p style={{ marginTop: 6, color: 'var(--color-ink-3)' }}>
            Напишите нам, и менеджер подскажет актуальный статус по каталогам, срокам и документам.
          </p>
        </div>
        <Link href="/contacts" className="btn btn-primary btn-lg">
          Связаться <Icons.arrow />
        </Link>
      </section>
    </StaticPage>
  );
}
