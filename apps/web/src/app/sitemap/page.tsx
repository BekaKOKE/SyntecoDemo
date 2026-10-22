import { StaticPage } from '@/components/layouts/StaticPage';
import Link from 'next/link';

const SITEMAP = [
  {
    title: 'Официальные дистрибьюторы',
    links: [
      { label: 'Honeywell', href: '/brands/honeywell' },
      { label: 'PIP Global', href: '/brands/pip' },
      { label: '3M', href: '/brands/3m' },
      { label: 'Master Lock', href: '/brands/master-lock' },
      { label: 'Ansul', href: '/brands/ansul' },
      { label: 'Uvex', href: '/brands/uvex' },
    ],
  },
  {
    title: 'Каталог',
    links: [
      { label: 'Каталог товаров', href: '/products' },
      { label: 'Категории', href: '/categories' },
      { label: 'Бренды', href: '/brands' },
      { label: 'Поиск', href: '/search' },
    ],
  },
  {
    title: 'Покупателям',
    links: [
      { label: 'Как заказать', href: '/help' },
      { label: 'Доставка', href: '/delivery' },
      { label: 'Возврат и обмен', href: '/returns' },
      { label: 'Помощь и FAQ', href: '/help' },
      { label: 'Обратная связь', href: '/feedback' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О компании', href: '/about' },
      { label: 'Услуги', href: '/services' },
      { label: 'Филиалы', href: '/branches' },
      { label: 'Контакты', href: '/contacts' },
      { label: 'Карьера', href: '/careers' },
      { label: 'Поставщикам', href: '/suppliers' },
    ],
  },
  {
    title: 'Личный кабинет',
    links: [
      { label: 'Вход', href: '/login' },
      { label: 'Регистрация', href: '/register' },
      { label: 'Корзина', href: '/cart' },
      { label: 'Мои заказы', href: '/accounts/orders' },
      { label: 'Мои запросы', href: '/accounts/inquiries' },
    ],
  },
  {
    title: 'Правовая информация',
    links: [
      { label: 'Политика конфиденциальности', href: '/privacy' },
      { label: 'Условия использования', href: '/terms' },
      { label: 'Карта сайта', href: '/sitemap' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <StaticPage title="Карта сайта" subtitle="Все страницы платформы Synteco." compact>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {SITEMAP.map(section => (
          <div key={section.title} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{section.title}</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.links.map(link => (
                <Link key={link.href} href={link.href} style={{ fontSize: 14, color: 'var(--color-ink-2)', padding: '4px 0' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
