import Link from 'next/link';
import { Icons } from '@/lib/icons';

type FooterLink = {
  label: string;
  href: string;
  accent?: boolean;
};

type FooterColumn = {
  title: string;
  note: string;
  links: FooterLink[];
};

const FOOTER: FooterColumn[] = [
  {
    title: 'Компания',
    note: 'Synteco как B2B-партнер',
    links: [
      { label: 'О компании', href: '/about' },
      { label: 'Услуги', href: '/services' },
      { label: 'Бренды', href: '/brands' },
      { label: 'Новости', href: '/blog' },
      { label: 'Вакансии', href: '/careers' },
      { label: 'Поставщикам', href: '/suppliers' },
    ],
  },
  {
    title: 'Покупателям',
    note: 'Поддержка закупок и логистики',
    links: [
      { label: 'Помощь', href: '/help' },
      { label: 'Доставка', href: '/delivery' },
      { label: 'Оплата', href: '/help#payment' },
      { label: 'Возврат', href: '/returns' },
      { label: 'Филиалы', href: '/branches' },
      { label: 'Обратная связь', href: '/feedback' },
    ],
  },
  {
    title: 'Заказы',
    note: 'КП, каталоги и спецпоставки',
    links: [
      { label: 'Запросить КП', href: '/contacts', accent: true },
      { label: 'Заказ каталога', href: '/contacts' },
      { label: 'Статус заказа', href: '/accounts/orders' },
      { label: 'Спецзаказы', href: '/contacts' },
      { label: 'Сервис и замена', href: '/services' },
    ],
  },
  {
    title: 'Ресурсы',
    note: 'Каталог и рабочие материалы',
    links: [
      { label: 'Каталог товаров', href: '/products', accent: true },
      { label: 'Электронные каталоги', href: '/products' },
      { label: 'Горячие предложения', href: '/products?sortBy=price&sortDir=asc' },
      { label: 'Новости Synteco', href: '/blog' },
      { label: 'Карта сайта', href: '/sitemap' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-site site-footer-inner">
        <section className="site-footer-cta">
          <div style={{ minWidth: 0 }}>
            <div className="site-footer-eyebrow">B2B industrial supply</div>
            <h2>Нужны товары, аналоги или официальный каталог?</h2>
            <p>
              Отправьте заявку, и менеджер Synteco поможет с подбором, сроками, документами и коммерческим предложением.
            </p>
          </div>
          <div className="site-footer-actions">
            <Link href="/contacts" className="btn btn-primary">
              Запросить КП <Icons.arrow />
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Открыть каталог
            </Link>
          </div>
        </section>

        <div className="footer-grid">
          {FOOTER.map((col) => (
            <nav key={col.title} className="footer-section-card" aria-label={col.title}>
              <div className="footer-section-head">
                <span />
                <h4>{col.title}</h4>
              </div>
              <p>{col.note}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={link.accent ? 'footer-link accent' : 'footer-link'}>
                      <span>{link.label}</span>
                      <Icons.arrow />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <aside className="footer-contact-card">
            <div className="footer-section-head">
              <span />
              <h4>Свяжитесь с нами</h4>
            </div>
            <p>Рабочий контакт для заказов, КП и уточнения наличия.</p>
            <div className="footer-contact-list">
              <a href="tel:+77024751703">
                <Icons.phone />
                <span>+7 702 475 17 03</span>
              </a>
              <a href="mailto:j.tolegenova@synteco.kz">
                <Icons.mail />
                <span>j.tolegenova@synteco.kz</span>
              </a>
              <div>
                <Icons.mapPin />
                <span>Казахстан, Атырау, Проспект Азаттық, д. 2</span>
              </div>
              <div>
                <Icons.clock />
                <span>Пн-Пт: 09:00-18:00</span>
              </div>
            </div>
            <Link href="/contacts" className="footer-contact-button">
              Контакты <Icons.arrow />
            </Link>
          </aside>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-brand">
            <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="0" y="0" width="32" height="32" rx="7" fill="rgba(255,255,255,0.16)" />
              <path d="M9 10 L22 10 L22 14 L13 14 L13 15 L22 15 L22 22 L9 22 L9 18 L18 18 L18 17 L9 17 Z" fill="var(--color-accent)" />
            </svg>
            <span>© 2026 Synteco. Все права защищены.</span>
          </div>
          <div className="site-footer-legal">
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/terms">Условия использования</Link>
            <Link href="/sitemap">Карта сайта</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
