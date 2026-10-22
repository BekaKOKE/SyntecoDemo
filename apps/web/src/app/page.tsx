'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/molecules/ProductCard';
import { ProductAdvisor } from '@/components/molecules/ProductAdvisor';
import { Icons } from '@/lib/icons';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { PhoneInput } from '@/components/molecules/PhoneInput';
import { getOfficialBrands } from '@/config/brands';
import { getShowcaseProducts } from '@/config/home-showcase';


// ── Hero ───────────────────────────────────────────────

/**
 * Homepage hero: full-bleed photo backdrop + rotating message.
 * Each shot keeps its subject on the right and open sky/floor on the left,
 * so the copy column lands on empty frame instead of fighting the image.
 * Sources live in public/hero as 1920×800 WebP (~160 KB each).
 */
const HERO_SLIDES = [
  {
    id: 'siz',
    img: '/hero/siz.webp',
    badge: 'Официальный дистрибьютор',
    title: <>СИЗ и промышленная <span className="home-hero-accent">безопасность</span></>,
    lead: 'PIP, SATA, 3M, Honeywell, Ansul, uvex, Rosenbauer и другие мировые производители — напрямую, с гарантией и техдокументацией.',
    primary: { href: '/brands', label: 'Наши бренды' },
    secondary: { href: '/about', label: 'О компании' },
  },
  {
    id: 'sklad',
    img: '/hero/snabzhenie.webp',
    badge: 'Собственный склад в Атырау',
    title: <>Промышленное снабжение <span className="home-hero-accent">без простоев</span></>,
    lead: 'Инструмент, СИЗ, электрика, крепёж и MRO — со склада и под заказ, с полным пакетом закрывающих документов.',
    primary: { href: '/categories', label: 'Каталог продукции' },
    secondary: { href: '/podbor', label: 'Подобрать товар' },
  },
  {
    id: 'neftegaz',
    img: '/hero/otrasli.webp',
    badge: 'Нефтегаз · Энергетика · Горная добыча',
    title: <>Отраслевые решения <span className="home-hero-accent">под ключ</span></>,
    lead: 'Комплектуем буровые, НПЗ и производственные площадки. Сертификация ТР ТС 012/2011, техническая документация на каждую позицию.',
    primary: { href: '/products', label: 'Отраслевые решения' },
    secondary: { href: '/contacts', label: 'Запросить КП' },
  },
];

/** Auto-advance cadence. Slides never scale — all three shots are 1920×800 and
 *  render at exactly the same size, so switching is a pure cross-fade. */
const HERO_INTERVAL = 5600;

function HomeHero() {
  // The outgoing index is kept around on purpose: it stays fully opaque
  // underneath while the incoming layer fades in on top. Fading both at once
  // let the black plate bleed through at the midpoint and read as a flicker.
  const [{ cur, prev }, setSlide] = useState<{ cur: number; prev: number }>({ cur: 0, prev: -1 });
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setSlide(s => {
      const n = ((next % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length;
      return n === s.cur ? s : { cur: n, prev: s.cur };
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    // Respect users who asked the OS to reduce motion — no auto-rotation.
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const timer = setInterval(
      () => setSlide(s => ({ cur: (s.cur + 1) % HERO_SLIDES.length, prev: s.cur })),
      HERO_INTERVAL,
    );
    return () => clearInterval(timer);
  }, [paused]);

  const idx = cur;

  // `noUncheckedIndexedAccess` treats an indexed read as possibly undefined,
  // so fall back to the first slide instead of asserting.
  const slide = HERO_SLIDES[idx] ?? HERO_SLIDES[0];
  if (!slide) return null;

  return (
    <section
      className="home-hero"
      aria-label="Synteco — промышленное снабжение"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="home-hero-media" aria-hidden="true">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`home-hero-layer${i === cur ? ' is-active' : i === prev ? ' is-prev' : ''}`}
            style={{ backgroundImage: `url(${s.img})` }}
          />
        ))}
      </div>
      <div className="home-hero-scrim" aria-hidden="true" />

      <div className="container-site home-hero-inner">
        {/* Все три слайда лежат в ОДНОЙ ячейке грида, а не подменяются по очереди.
            Благодаря этому высота блока всегда равна самому высокому слайду и не
            зависит от того, какой сейчас активен. Раньше здесь был один блок с
            текстом текущего слайда: у «Промышленное снабжение без простоев»
            заголовок переносится на 3 строки вместо 2, hero подрастал под него на
            30–60px, и при переключении весь кадр заметно уезжал вниз. */}
        <div className="home-hero-stack">
          {HERO_SLIDES.map((s, i) => {
            const active = i === idx;
            // Заголовок активного слайда — h1, у скрытых — div: на странице
            // должен остаться ровно один h1.
            const Title = (active ? 'h1' : 'div') as 'h1' | 'div';
            return (
              <div
                key={s.id}
                className={`home-hero-copy${active ? ' is-active' : ''}`}
                aria-hidden={!active}
              >
                <span className="home-hero-badge">
                  <Icons.shield width={14} height={14} />
                  {s.badge}
                </span>
                <Title className="home-hero-title">{s.title}</Title>
                <p className="home-hero-lead">{s.lead}</p>
                <div className="home-hero-cta">
                  <Link
                    href={s.primary.href}
                    className="home-hero-btn home-hero-btn--solid"
                    tabIndex={active ? undefined : -1}
                  >
                    {s.primary.label} <Icons.arrow />
                  </Link>
                  <Link
                    href={s.secondary.href}
                    className="home-hero-btn home-hero-btn--ghost"
                    tabIndex={active ? undefined : -1}
                  >
                    {s.secondary.label}
                  </Link>
                </div>
                <div className="home-hero-stats">
                  {[
                    { v: '14', l: 'официальных брендов' },
                    { v: '10 000+', l: 'позиций в каталоге' },
                    { v: '100%', l: 'оригинальная продукция' },
                  ].map(st => (
                    <div key={st.l} className="home-hero-stat">
                      <strong className="mono">{st.v}</strong>
                      <span>{st.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-hero-controls">
        <div className="home-hero-dots" role="tablist" aria-label="Слайды">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Слайд ${i + 1}`}
              className={`home-hero-dot${i === idx ? ' is-active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div className="home-hero-arrows">
          <button className="home-hero-arrow" onClick={() => go(idx - 1)} aria-label="Предыдущий слайд">
            <Icons.chevR style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button className="home-hero-arrow" onClick={() => go(idx + 1)} aria-label="Следующий слайд">
            <Icons.chevR />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Categories Section ─────────────────────────────────

const CAT_LIST = [
  { slug: 'bezopasnost', name: 'Безопасность', img: '/categories/bezopasnost.webp' },
  { slug: 'instrumenty', name: 'Инструменты', img: '/categories/instrumenty.webp' },
  { slug: 'elektrika', name: 'Электрика', img: '/categories/elektrika.webp' },
  { slug: 'pnevmatika', name: 'Пневматика', img: '/categories/pnevmatika.webp' },
  { slug: 'gidravlika', name: 'Гидравлика', img: '/categories/gidravlika.webp' },
  { slug: 'krepezh', name: 'Крепеж', img: '/categories/krepezh.webp' },
  { slug: 'podshipniki', name: 'Подшипники', img: '/categories/podshipniki.webp' },
  { slug: 'dvigateli', name: 'Двигатели', img: '/categories/dvigateli.webp' },
  { slug: 'svarka', name: 'Сварка', img: '/categories/svarka.webp' },
  { slug: 'santekhnika', name: 'Сантехника', img: '/categories/santekhnika.webp' },
  { slug: 'uborka', name: 'Уборка', img: '/categories/uborka.webp' },
  { slug: 'upakovka', name: 'Упаковка', img: '/categories/upakovka.webp' },
  { slug: 'laboratoriya', name: 'Лаборатория', img: '/categories/laboratoriya.webp' },
  { slug: 'avtopark', name: 'Автопарк', img: '/categories/avtopark.webp' },
];

function CategoriesSection() {
  return (
    <section style={{ background: 'var(--color-bg)', padding: '56px 0' }}>
      <div className="container-site">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 20 }}>
          <div>
            <div className="eyebrow">02 · Каталог</div>
            <h2 style={{ marginTop: 8 }}>Категории промышленного снабжения</h2>
          </div>
          <Link href="/categories" className="btn btn-secondary btn-sm hide-mobile">
            Все категории <Icons.arrow />
          </Link>
        </div>

        <div className="home-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {CAT_LIST.map(c => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="card card-lift"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ aspectRatio: '1 / 1', position: 'relative', background: 'var(--color-surface-2)', overflow: 'hidden', padding: '14%' }}>
                <Image
                  src={c.img}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 14vw"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{c.name}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="show-mobile" style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/categories" className="btn btn-secondary btn-sm">Все категории <Icons.arrow /></Link>
        </div>
      </div>
    </section>
  );
}

// ── Featured Products ──────────────────────────────────

function FeaturedProductsSection() {
  // Витрина статична: десять отобранных позиций из нашего каталога, у каждой
  // есть описание и техпаспорт. Раньше здесь были вкладки «Рекомендуемые» и
  // «Новинки», но «Новинки» сортировали базу по дате и вытаскивали на главную
  // непереведённый импорт (Twist Drill, Bolt and Gasket Kit) — из ста самых
  // свежих товаров русское название было лишь у семи. Вкладки убраны,
  // за полным ассортиментом ведёт ссылка справа.
  const products = getShowcaseProducts();

  return (
    <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-hair)', borderBottom: '1px solid var(--color-hair)', padding: '56px 0' }}>
      <div className="container-site">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 20 }}>
          <div>
            <div className="eyebrow">04 · Товары</div>
            <h2 style={{ marginTop: 8 }}>Популярные товары</h2>
          </div>
          <Link href="/products" className="btn btn-ghost btn-sm">
            Весь каталог <Icons.arrow />
          </Link>
        </div>

        <div className="home-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              variantId={p.variantId}
              brandName={p.brandName}
              price={0}
              imageUrl={p.imageUrl}
              availability="on_request"
              stockTotal={0}
              descriptionRu={p.descriptionRu}
              attributes={p.attributes}
              documents={p.documents}
              href={p.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Brands Band ────────────────────────────────────────

// ── Official Distributors (replaces old BrandsBand) ────

function OfficialDistributorsV2() {
  const brands = getOfficialBrands();
  return (
    <section className="industrial-section home-brand-showcase">
      <div className="container-site">
        <div className="home-brand-shell">
          <div className="home-brand-intro">
            <div>
              <div className="eyebrow industrial-eyebrow">01 · Официальные дистрибьюторы</div>
              <h2 style={{ marginTop: 10 }}>Бренды, которые мы представляем официально</h2>
              <p className="industrial-copy">
                Прямой доступ к решениям мировых производителей, технической документации
                и B2B-поставкам по Казахстану.
              </p>
            </div>
            <div className="home-brand-intro-side">
              <div className="home-brand-proof">
                <strong>{brands.length}</strong>
                <span>официальных брендов</span>
              </div>
              <div className="home-brand-actions">
                <Link href="/brands" className="btn btn-primary">
                  Подробнее о брендах <Icons.arrow />
                </Link>
                <Link href="/contacts" className="btn btn-secondary">
                  Запросить КП
                </Link>
              </div>
            </div>
          </div>

          <div className="home-brand-wall">
            {brands.map(b => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="home-brand-tile"
                style={{ '--brand-accent': b.heroColor } as CSSProperties}
                aria-label={`${b.name} — открыть страницу официального бренда`}
                title={`${b.name} — официальный дистрибьютор`}
              >
                <span className="home-brand-badge">Official</span>
                <div className="home-brand-logo">
                  <Image
                    src={b.logoUrl}
                    alt={`${b.name} — официальный дистрибьютор`}
                    width={150}
                    height={64}
                    sizes="(max-width: 639px) 42vw, (max-width: 1199px) 22vw, 140px"
                  />
                </div>
                <div className="home-brand-tile-footer">
                  <span>{b.name}</span>
                  <span className="home-brand-arrow" aria-hidden="true"><Icons.arrow /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OfficialDistributors() {
  const brands = getOfficialBrands();
  return (
    <section style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-hair)', padding: '56px 0' }}>
      <div className="container-site">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow">05 · Официальные дистрибьюторы</div>
            <h2 style={{ marginTop: 8 }}>Бренды, которые мы представляем официально</h2>
            <p className="muted" style={{ marginTop: 8, fontSize: 14, maxWidth: 620 }}>
              Мы — авторизованный поставщик мировых производителей СИЗ, пожарной безопасности и спецоборудования в Казахстане.
            </p>
          </div>
          <Link href="/brands" className="btn btn-secondary hide-mobile">Все бренды <Icons.arrow /></Link>
        </div>
        <div className="home-brands-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 720, margin: '0 auto' }}>
          {brands.map(b => (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="card card-lift"
              style={{
                display: 'block',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                position: 'relative',
              }}
              title={`${b.name} — официальный дистрибьютор`}
            >
              <Image
                src={b.logoUrl}
                alt={`${b.name} — официальный дистрибьютор`}
                fill
                sizes="(max-width: 639px) 50vw, 240px"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </Link>
          ))}
        </div>
        <div className="show-mobile" style={{ marginTop: 16, justifyContent: 'center' }}>
          <Link href="/brands" className="btn btn-secondary btn-sm">Все бренды <Icons.arrow /></Link>
        </div>
      </div>
    </section>
  );
}

// ── Procurement Section ────────────────────────────────

function ProcurementSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const features = [
    { code: '01', title: 'Контрактные цены', note: 'Персональный прайс-лист, скидки от объёма. Цены фиксируются в договоре.' },
    { code: '02', title: 'Персональный менеджер', note: 'Один контакт на все вопросы — от подбора до отгрузки.' },
    { code: '03', title: 'Заявки и КП', note: 'Отправьте запрос в 2 клика. Получите коммерческое предложение с НДС.' },
    { code: '04', title: 'История заказов', note: 'Все заявки и счета в личном кабинете. Повтор заказа в один клик.' },
    { code: '05', title: 'Доставка по Казахстану', note: 'Собственный склад в Атырау. Отправка в регионы — от 1 дня.' },
    { code: '06', title: 'Закрывающие документы', note: 'Счёт-фактура, накладная, акт — оригиналы и электронно.' },
  ];

  return (
    <section style={{ background: 'var(--color-bg)', padding: '64px 0' }}>
      <div className="container-site">
        <div className="procurement-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: 48, alignItems: 'start' }}>
          <div>
            <div className="eyebrow">05 · Для отдела снабжения</div>
            <h2 style={{ marginTop: 8 }}>Снабжение без головной боли.</h2>
            <p className="muted" style={{ marginTop: 16, fontSize: 15 }}>
              Контрактные цены, персональный менеджер, заявки в 2 клика и все закрывающие документы.
              Получите КП с НДС — мы работаем официально и прозрачно.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <Link href={isAuthenticated ? '/accounts/dashboard' : '/login'} className="btn btn-inverted">
                {isAuthenticated ? 'Перейти в кабинет' : 'Открыть кабинет'} <Icons.arrow />
              </Link>
              <Link href="/contacts" className="btn btn-secondary">Связаться с отделом продаж</Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-hair)', border: '1px solid var(--color-hair)', borderRadius: 16, overflow: 'hidden' }}>
            {features.map(f => (
              <div key={f.code} style={{ padding: 22, background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--color-ink-4)', letterSpacing: '0.1em' }}>{f.code}</span>
                  <Icons.check style={{ color: 'var(--color-ok)' }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 14, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Industries ─────────────────────────────────────────

function IndustriesSection() {
  const industries = [
    { code: 'O&G', title: 'Нефть и газ', note: 'Снабжение буровых, НПЗ, трубопроводов. Сертификация ТР ТС 012/2011.' },
    { code: 'CNS', title: 'Строительство', note: 'Инструмент, крепёж, СИЗ, электрика для генподрядчиков и субподрядчиков.' },
    { code: 'MFG', title: 'Производство', note: 'MRO для станков, конвейеров, роботизированных линий. Предиктивные закупки.' },
    { code: 'ENG', title: 'Энергетика', note: 'Высоковольтное оборудование, КИПиА, кабельная продукция, заземление.' },
    { code: 'MIN', title: 'Горная добыча', note: 'Карьерная техника, конвейерные ленты, дробильное оборудование, вентиляция.' },
    { code: 'LOG', title: 'Логистика', note: 'Складская техника, упаковка, стеллажи, погрузчики, запчасти для автопарка.' },
  ];

  return (
    <section style={{ background: 'var(--color-bg)', padding: '56px 0' }}>
      <div className="container-site">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">06 · Отрасли</div>
            <h2 style={{ marginTop: 8 }}>Отраслевые решения «под ключ»</h2>
          </div>
        </div>
        <div className="industries-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-hair)', border: '1px solid var(--color-hair)', borderRadius: 16, overflow: 'hidden' }}>
          {industries.map(it => (
            <Link key={it.code} href={`/products?industry=${it.code}`} style={{ background: 'var(--color-surface)', padding: 28, textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>отрасль · {it.code}</span>
                <Icons.arrow style={{ color: 'var(--color-ink-4)' }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginTop: 28, letterSpacing: '-0.02em' }}>{it.title}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>{it.note}</div>
              <div className="hairt" style={{ marginTop: 24, paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>отрасль · {it.code}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>MRO</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Callback + Form ────────────────────────────────────

function CallbackSection() {
  return (
    <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-hair)', borderBottom: '1px solid var(--color-hair)', padding: '56px 0' }}>
      <div className="container-site callback-section" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 64, alignItems: 'center' }}>
        <div>
          <div className="eyebrow">Персональный подбор</div>
          <h2 style={{ marginTop: 10, fontSize: 36 }}>Не нашли свой <span style={{ color: 'var(--color-accent)' }}>продукт</span>?</h2>
          <p className="muted" style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55, maxWidth: 460 }}>
            Оставьте заявку — менеджер свяжется с вами, найдёт нужный артикул или подберёт аналог
            под ваши требования и бюджет.
          </p>
          <div className="hairt" style={{ marginTop: 28, paddingTop: 18 }}>
            <div style={{ display: 'flex', gap: 14, color: 'var(--color-ink-2)', fontSize: 13, alignItems: 'center' }}>
              <Icons.user style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontWeight: 500 }}>Жасмин Толегенова</div>
                <div className="muted" style={{ fontSize: 12 }}>Менеджер по работе с клиентами</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, color: 'var(--color-ink-2)', fontSize: 13, marginTop: 14, alignItems: 'center' }}>
              <Icons.phone />
              <a href="tel:+77024751703" style={{ fontWeight: 500 }}>+7 702 475 17 03</a>
            </div>
            <div style={{ display: 'flex', gap: 14, color: 'var(--color-ink-2)', fontSize: 13, marginTop: 14, alignItems: 'center' }}>
              <Icons.mail />
              <a href="mailto:j.tolegenova@synteco.kz" style={{ fontWeight: 500 }}>j.tolegenova@synteco.kz</a>
            </div>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.elements.namedItem('name') as HTMLInputElement)?.value?.trim();
            const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value?.trim();
            const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
            const desc = (form.elements.namedItem('desc') as HTMLTextAreaElement)?.value?.trim();
            if (!name || !phone || !email) return;

            const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            btn.disabled = true;
            btn.textContent = 'Отправка…';

            try {
              // Fetch CSRF token for public mutation endpoint
              let csrfToken = '';
              try {
                const csrfRes = await fetch('/api/v1/csrf-token');
                if (csrfRes.ok) {
                  const csrfData = await csrfRes.json();
                  csrfToken = csrfData.token;
                }
              } catch { /* proceed without CSRF token */ }

              const res = await fetch('/api/v1/admin/inquiries/public', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
                },
                body: JSON.stringify({
                  companyName: name,
                  contactName: name,
                  contactPhone: phone,
                  contactEmail: email,
                  priority: 'normal',
                  notes: desc || 'Заявка с сайта',
                }),
              });
              if (res.ok) {
                btn.textContent = 'Заявка отправлена';
                form.reset();
                setTimeout(() => { btn.textContent = 'Отправить заявку'; btn.disabled = false; }, 3000);
              } else {
                throw new Error('fail');
              }
            } catch {
              btn.textContent = 'Ошибка, попробуйте ещё раз';
              btn.disabled = false;
            }
          }}
          className="card" style={{ padding: 32, boxShadow: 'var(--shadow-2)' }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Ваше имя</label>
              <input name="name" className="input" placeholder="Ваше имя" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон *</label>
              <PhoneInput name="phone" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email *</label>
              <input name="email" type="email" className="input" placeholder="nurlan@company.kz" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Что нужно подобрать</label>
              <textarea name="desc" className="input" rows={4} placeholder="Опишите артикул, бренд или приложите ссылку…" style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Отправить заявку <Icons.arrow />
            </button>
            <p className="muted" style={{ fontSize: 11, lineHeight: 1.55, textAlign: 'center' }}>
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных согласно
              политике конфиденциальности.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────

function CTABand() {
  return (
    <section style={{ background: 'var(--color-ink)', color: 'var(--color-bg)', padding: '56px 0' }}>
      <div className="container-site cta-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 64, alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--color-ink-4)' }}>Бизнес-аккаунт</div>
          <h2 style={{ color: 'var(--color-bg)', marginTop: 10, fontSize: 44 }}>Закупки для вашей команды — в одном кабинете.</h2>
          <p style={{ color: 'var(--color-ink-3)', marginTop: 14, fontSize: 15, maxWidth: 580 }}>
            Контрактные цены, история заказов, пакет документов и менеджер на связи.
            Зарегистрируйте компанию — обсудим условия сотрудничества.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <Link href="/register" className="btn btn-primary btn-lg">Создать бизнес-аккаунт</Link>
            <Link href="/contacts" className="btn btn-secondary btn-lg" style={{ background: 'transparent', color: 'var(--color-bg)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Поговорить с менеджером
            </Link>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: <Icons.clipboard width={20} height={20} />, label: 'История заказов и КП' },
            { icon: <Icons.doc width={20} height={20} />, label: 'Полный пакет документов' },
            { icon: <Icons.shield width={20} height={20} />, label: 'Цены с НДС' },
            { icon: <Icons.user width={20} height={20} />, label: 'Персональный менеджер' },
          ].map(f => (
            <div key={f.label} style={{ padding: 24, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: 'var(--color-accent)' }}>{f.icon}</div>
              <div style={{ color: 'var(--color-ink-3)', fontSize: 13 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main ───────────────────────────────────────────────

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <HomeHero />
      <OfficialDistributorsV2 />
      <CategoriesSection />
      <ProductAdvisor />
      <FeaturedProductsSection />
      <CallbackSection />
      <ProcurementSection isAuthenticated={isAuthenticated} />
      <IndustriesSection />
      <CTABand />
    </div>
  );
}
