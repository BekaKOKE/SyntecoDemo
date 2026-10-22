'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getProducts, getFacets, type Product, type FacetsResponse } from '@/lib/api/products';
import { getCategory, type Category } from '@/lib/api/categories';
import { Icons } from '@/lib/icons';
import { flyToCart } from '@/components/molecules/CartFly';
import { FilterSidebar, type ActiveFilters } from '@/components/molecules/FilterSidebar';
import { FilterChips } from '@/components/molecules/FilterChips';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { CategoryFeaturedCatalog } from '@/components/catalog/CategoryFeaturedCatalog';
import { CATEGORY_FEATURED_CATALOGS } from '@/config/category-featured-catalogs';

const CATEGORY_SLUG_LABELS: Record<string, string> = {
  bezopasnost: 'Безопасность',
  instrumenty: 'Инструменты',
  krepezh: 'Крепеж',
  elektrika: 'Электрика',
  pnevmatika: 'Пневматика',
  gidravlika: 'Гидравлика',
  santekhnika: 'Сантехника',
  dvigateli: 'Двигатели',
  podshipniki: 'Подшипники',
  upakovka: 'Упаковка',
  laboratoriya: 'Лаборатория',
  uborka: 'Уборка',
  avtopark: 'Автопарк',
  svarka: 'Сварка',
  'syrye-materialy': 'Сырье и материалы',
  'promyshlennaya-furnitura': 'Промышленная фурнитура',
  'ohrannye-sistemy': 'Охранные системы',
  'mebel-i-hoztovary': 'Мебель и хозтовары',
  'lakokrasochnye-materialy': 'Лакокрасочные материалы',
  'ulichnoe-oborudovanie': 'Уличное оборудование',
  'ofisnye-tovary': 'Офисные товары',
  siz: 'СИЗ',
  'zashchita-ruk': 'Защита рук',
  'zashchita-glaz': 'Защита глаз',
  'zashchita-slukha': 'Защита слуха',
  respirators: 'Респираторы',
  'fire-extinguishers': 'Огнетушители',
  'loto-locks': 'Замки LOTO',
  spetsodezhda: 'Спецодежда',
  'znaki-bezopasnosti': 'Знаки и маркировка безопасности',
  elektroinstrumenty: 'Электроинструменты',
  'ruchnoy-instrument': 'Ручной инструмент',
  sverlenie: 'Сверление',
  'izmeritelnyy-instrument': 'Измерительный инструмент',
  osnastka: 'Оснастка',
  abrazivy: 'Абразивы',
  'nabory-instrumentov': 'Наборы инструментов',
  kabeli: 'Кабели и провода',
  'razemy-klemmy': 'Разъемы и клеммы',
  'shchity-korpusa': 'Щиты и корпуса',
  'avtomaty-predohraniteli': 'Автоматы и предохранители',
  'rele-kontaktory': 'Реле и контакторы',
  osveshchenie: 'Освещение',
  'kabel-kanaly': 'Кабель-каналы',
  kipia: 'КИПиА',
  'pnevmo-tsilindry': 'Пневмоцилиндры',
  'pnevmo-instrument': 'Пневмоинструмент',
  'pnevmo-klapany': 'Пневмоклапаны',
  kompressory: 'Компрессоры',
  'podgotovka-vozduha': 'Подготовка воздуха',
  'pnevmo-fitingi': 'Пневмофитинги',
  'pnevmo-shlangi': 'Пневмошланги',
  'gidro-tsilindry': 'Гидроцилиндры',
  'gidro-nasosy': 'Гидронасосы',
  'gidro-klapany': 'Гидроклапаны',
  'gidro-fitingi': 'Гидрофитинги',
  'gidro-rukava': 'Гидрорукава',
  'gidro-uplotneniya': 'Гидроуплотнения',
  'gidro-instrument': 'Гидроинструмент',
};

export default function CategoryDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<FacetsResponse | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 24, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // The sticky bar and the filter drawer are rendered into <body> so no
  // ancestor's stacking/clipping context can trap them (that's what let the
  // brand logos and the "К товарам" button paint over the open drawer).
  const [portalReady, setPortalReady] = useState(false);
  // Hidden at the very top of the page: there the mobile browser's own
  // toolbar sits over that strip, so taps never reached the button.
  const [barVisible, setBarVisible] = useState(false);

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(() => {
    const attrRaw = searchParams.get('attr');
    let attributes: Record<string, string[]> = {};
    if (attrRaw) {
      try {
        const parsed = JSON.parse(attrRaw);
        attributes = Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
        );
      } catch { attributes = {}; }
    }
    return {
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      brandId: searchParams.get('brand') ?? undefined,
      attributes,
      warehouseId: searchParams.get('warehouseId') ?? undefined,
      inStockOnly: searchParams.get('inStock') === 'true',
    };
  });
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

  useEffect(() => {
    let cancelled = false;
    setCategory(null);
    setRelatedCategories([]);

    getCategory(slug)
      .then(async (cat) => {
        if (cancelled) return;
        setCategory(cat);

        if (cat.children?.length) {
          setRelatedCategories(cat.children);
          return;
        }

        if (cat.parent?.slug) {
          const parent = await getCategory(cat.parent.slug);
          if (!cancelled) {
            setRelatedCategories((parent.children ?? []).filter((child) => child.slug !== cat.slug));
          }
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug]);
  useEffect(() => { if (category) getFacets({ categoryId: category.id }).then(setFacets).catch(() => {}); }, [category]);
  useEffect(() => {
    setPortalReady(true);
    const onScroll = () => setBarVisible(window.scrollY > 260);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileFilterOpen ? 'hidden' : '';
    if (!mobileFilterOpen) return () => { document.body.style.overflow = ''; };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFilterOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  const updateUrl = useCallback(
    (next: { filters: ActiveFilters; page: number }) => {
      const params = new URLSearchParams();
      if (next.filters.minPrice !== undefined) params.set('minPrice', String(next.filters.minPrice));
      if (next.filters.maxPrice !== undefined) params.set('maxPrice', String(next.filters.maxPrice));
      if (next.filters.brandId) params.set('brand', next.filters.brandId);
      if (Object.keys(next.filters.attributes).length > 0) params.set('attr', JSON.stringify(next.filters.attributes));
      if (next.filters.warehouseId) params.set('warehouseId', next.filters.warehouseId);
      if (next.filters.inStockOnly) params.set('inStock', 'true');
      if (next.page > 1) params.set('page', String(next.page));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const fetchProducts = useCallback(() => {
    if (!category) return;
    setLoading(true);
    getProducts({
      page, limit: meta.limit, sortBy, sortDir, categoryId: category.id,
      brandId: activeFilters.brandId,
      minPrice: activeFilters.minPrice, maxPrice: activeFilters.maxPrice,
      warehouseId: activeFilters.warehouseId,
      inStockOnly: activeFilters.inStockOnly || undefined,
      attributes: Object.keys(activeFilters.attributes).length > 0 ? JSON.stringify(activeFilters.attributes) : undefined,
    }).then((r) => { setProducts(r.data); setMeta(r.meta); setLoading(false); }).catch(() => setLoading(false));
  }, [category, page, meta.limit, sortBy, sortDir, activeFilters]);

  useEffect(() => { const t = setTimeout(fetchProducts, 300); return () => clearTimeout(t); }, [fetchProducts]);

  const handleFilterChange = (next: ActiveFilters) => { setActiveFilters(next); setPage(1); updateUrl({ filters: next, page: 1 }); };
  const handleReset = () => { const empty: ActiveFilters = { attributes: {}, inStockOnly: false }; setActiveFilters(empty); setPage(1); updateUrl({ filters: empty, page: 1 }); };
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => { const parts = e.target.value.split('-'); setSortBy(parts[0] || 'relevance'); setSortDir((parts[1] as 'asc' | 'desc') || 'desc'); };
  const activeFilterCount = useMemo(() => {
    const attributeCount = Object.values(activeFilters.attributes).reduce((sum, values) => sum + values.length, 0);
    return attributeCount
      + (activeFilters.brandId ? 1 : 0)
      + (activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined ? 1 : 0)
      + (activeFilters.warehouseId ? 1 : 0)
      + (activeFilters.inStockOnly ? 1 : 0);
  }, [activeFilters]);
  const topBrands = useMemo(() => facets?.brands.slice(0, 8) ?? [], [facets]);
  const visibleRelatedCategories = useMemo(
    () => relatedCategories.filter((item) => item.productCount > 0).slice(0, 12),
    [relatedCategories],
  );
  const featuredCatalog = CATEGORY_FEATURED_CATALOGS[slug];
  // Только число: подпись плашки уже говорит «Товары», а «248 товаров» на
  // телефоне переносилось на две строки и ломало ряд.
  const totalProductsLabel = loading ? '…' : meta.total.toLocaleString('ru-RU');
  const relatedTitle = category?.children?.length ? 'Подкатегории' : 'Соседние подкатегории';
  const categoryTitle = category?.name ?? CATEGORY_SLUG_LABELS[slug] ?? 'Каталог';
  const categoryDescription = category?.parent
    ? `Подбор товаров внутри раздела «${category.parent.name}»: быстрые фильтры, бренды и наличие по складам.`
    : 'Промышленное снабжение для B2B-заказов: категории, бренды, фильтры и товары в наличии.';
  const mobileResultsLabel = loading
    ? 'Обновляем выдачу...'
    : `Показать ${meta.total.toLocaleString('ru-RU')} товаров`;

  return (
    <div className="container-site has-catalog-bar" style={{ padding: '24px 24px 40px' }}>
      <section
        style={{
          border: '1px solid var(--color-hair)',
          borderRadius: 8,
          background: 'var(--color-surface)',
          padding: '18px 20px',
          marginBottom: 18,
        }}
      >
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Link href="/" className="muted" style={{ fontSize: 12, textDecoration: 'none' }}>Главная</Link>
          <span className="muted" style={{ fontSize: 12 }}>/</span>
          <Link href="/categories" className="muted" style={{ fontSize: 12, textDecoration: 'none' }}>Каталог</Link>
          <span className="muted" style={{ fontSize: 12 }}>/</span>
          {category?.parent ? (
            <>
              <Link href={`/categories/${category.parent.slug}`} className="muted" style={{ fontSize: 12, textDecoration: 'none' }}>{category.parent.name}</Link>
              <span className="muted" style={{ fontSize: 12 }}>/</span>
            </>
          ) : null}
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink-2)' }}>{categoryTitle}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20, alignItems: 'end' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 7 }}>
              01 · Каталог
            </div>
            <h1 style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 750, margin: 0 }}>{categoryTitle}</h1>
            <p style={{ margin: '9px 0 0', maxWidth: 720, color: 'var(--color-ink-3)', fontSize: 14, lineHeight: 1.55 }}>
              {categoryDescription}
            </p>
          </div>

          <div className="cat-hero-metrics">
            <MetricPill label="Товары" value={totalProductsLabel} />
            {visibleRelatedCategories.length > 0 ? <MetricPill label="Разделы" value={String(visibleRelatedCategories.length)} /> : null}
            {topBrands.length > 0 ? <MetricPill label="Бренды" value={String(topBrands.length)} /> : null}
          </div>
        </div>
      </section>

      {featuredCatalog ? <CategoryFeaturedCatalog config={featuredCatalog} /> : null}

      {visibleRelatedCategories.length > 0 ? (
        <section style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-4)', marginBottom: 4 }}>
                {relatedTitle}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Быстрый переход в уточненные направления каталога
              </div>
            </div>
            {category?.parent ? (
              <Link href={`/categories/${category.parent.slug}`} style={{ color: 'var(--color-accent)', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                Весь раздел →
              </Link>
            ) : null}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
            {visibleRelatedCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/categories/${item.slug}`}
                className="category-nav-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  minHeight: 54,
                  padding: '11px 12px',
                  border: '1px solid var(--color-hair)',
                  borderRadius: 8,
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  background: 'var(--color-surface)',
                  fontSize: 13,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, lineHeight: 1.25 }}>{item.name}</span>
                  <span className="muted" style={{ display: 'block', fontSize: 11, marginTop: 3 }}>Открыть категорию</span>
                </span>
                <span style={{
                  minWidth: 34,
                  height: 24,
                  padding: '0 8px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-ink-3)',
                  border: '1px solid var(--color-hair)',
                  fontSize: 11,
                  fontWeight: 800,
                }}>{item.productCount}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {topBrands.length > 1 ? (
        <section
          style={{
            marginBottom: 18,
            border: '1px solid var(--color-hair)',
            borderRadius: 8,
            background: 'var(--color-surface-2)',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-4)', marginBottom: 4 }}>
                Популярные бренды в разделе
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Нажмите бренд, чтобы быстро сузить выдачу
              </div>
            </div>
            {activeFilters.brandId ? (
              <button onClick={() => handleFilterChange({ ...activeFilters, brandId: undefined })} style={{ border: 0, background: 'transparent', color: 'var(--color-accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Сбросить бренд
              </button>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topBrands.map((brand) => {
              const selected = activeFilters.brandId === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => handleFilterChange({ ...activeFilters, brandId: selected ? undefined : brand.id })}
                  style={{
                    border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-hair)'}`,
                    background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: selected ? '#fff' : 'var(--color-ink-2)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    gap: 7,
                    alignItems: 'center',
                  }}
                >
                  <span>{brand.name}</span>
                  <span style={{
                    minWidth: 22,
                    height: 20,
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: selected ? 'rgba(255,255,255,0.18)' : 'var(--color-surface-2)',
                    fontSize: 11,
                  }}>{brand.count}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {portalReady ? createPortal((
      <div className="show-mobile">
        {/* Sticky action bar: filters + sorting stay reachable no matter how
            far down the listing you are. Docked left of the WhatsApp button. */}
        <div className={`mobile-catalog-bar${barVisible ? '' : ' is-hidden'}`}>
          <button type="button" className="mcb-btn" onClick={() => setMobileFilterOpen(true)}>
            <Icons.filter />
            <span>Фильтры</span>
            {activeFilterCount > 0 ? <span className="mcb-count">{activeFilterCount}</span> : null}
          </button>
          <span className="mcb-divider" aria-hidden="true" />
          <span className="mcb-btn">
            <Icons.list />
            <span>{SORT_LABELS[`${sortBy}-${sortDir}`] ?? 'Сортировка'}</span>
            <select value={`${sortBy}-${sortDir}`} onChange={handleSort} aria-label="Сортировка">
              <option value="relevance-desc">Сначала лучшие</option>
              <option value="createdAt-desc">Новые</option>
              <option value="title-asc">По названию</option>
            </select>
          </span>
        </div>
        {mobileFilterOpen && (
          <div className="mobile-filter-shell" role="dialog" aria-modal="true" aria-label="Фильтры каталога">
            <button
              className="mobile-filter-backdrop"
              aria-label="Закрыть фильтры"
              onClick={() => setMobileFilterOpen(false)}
            />
            <aside className="mobile-filter-panel">
              <div className="mobile-filter-header">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-ink)' }}>Фильтры</div>
                  <div className="muted" style={{ marginTop: 2, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {categoryTitle}
                  </div>
                </div>
                <button onClick={() => setMobileFilterOpen(false)} className="mobile-filter-close" aria-label="Закрыть фильтры">
                  <Icons.close />
                </button>
              </div>
              <div className="mobile-filter-content">
                <FilterSidebar facets={facets} active={activeFilters} onChange={handleFilterChange} onReset={handleReset} />
              </div>
              <div className="mobile-filter-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleReset}
                  disabled={activeFilterCount === 0}
                  style={{ height: 42, opacity: activeFilterCount === 0 ? 0.45 : 1 }}
                >
                  Сбросить
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setMobileFilterOpen(false)} style={{ height: 42, flex: 1 }}>
                  {mobileResultsLabel}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
      ), document.body) : null}
      <div id="category-products" className="layout-sidebar" style={{ scrollMarginTop: 'calc(var(--header-h) + 16px)' }}>
        <aside className="hide-mobile"><FilterSidebar facets={facets} active={activeFilters} onChange={handleFilterChange} onReset={handleReset} /></aside>
        <section style={{ minWidth: 0 }}>
          <div className="card catalog-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 12, borderRadius: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{loading ? '…' : `${meta.total.toLocaleString('ru-RU')} товаров`}</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-hair)' }}>
                <button onClick={() => setView('grid')} style={view === 'grid' ? viewToggleActive : viewToggleBase}><Icons.grid /></button>
                <button onClick={() => setView('list')} style={view === 'list' ? viewToggleActive : viewToggleBase}><Icons.list /></button>
              </div>
              <select className="input" style={{ height: 32, fontSize: 12, padding: '0 8px' }} value={`${sortBy}-${sortDir}`} onChange={handleSort}>
                <option value="relevance-desc">Сначала лучшие</option><option value="createdAt-desc">Новые</option><option value="title-asc">По названию</option>
              </select>
            </div>
          </div>
          <FilterChips active={activeFilters} facets={facets} onRemove={(next) => { setActiveFilters(next); setPage(1); updateUrl({ filters: next, page: 1 }); }} onReset={handleReset} />
          {loading ? (
            <div className={view === 'grid' ? 'grid-3' : ''} style={{ gap: view === 'grid' ? 16 : 8 }}>{Array.from({ length: 6 }, (_, i) => (<div key={i} className="card skeleton" style={{ height: 300 }} />))}</div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}><p style={{ fontSize: 16, color: 'var(--color-ink-3)' }}>Ничего не найдено</p><p className="muted" style={{ marginTop: 8, fontSize: 13 }}>Попробуйте изменить фильтры.</p><button onClick={handleReset} className="btn btn-primary" style={{ marginTop: 16 }}>Сбросить фильтры</button></div>
          ) : view === 'grid' ? (
            <div className="grid-3" style={{ gap: 16 }}>{products.map((p: Product) => {
              const st = p.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
              return (<ProductCard key={p.id} id={p.id} title={p.title} variantId={p.variantId} brandName={p.brand?.name} price={Number(p.price)} salePrice={p.salePrice ? Number(p.salePrice) : null} imageUrl={p.imageUrl} availability={p.availability} stockTotal={st} mpn={p.mpn} description={p.description} descriptionRu={p.descriptionRu} attributes={p.attributes} specifications={p.specifications} documents={p.documents} createdAt={p.createdAt} variant="grid" onAddToCart={() => { if (p.imageUrl) flyToCart(document.activeElement as HTMLElement, p.imageUrl); }} />);
            })}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{products.map((p: Product) => {
              const st = p.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
              return (<ProductCard key={p.id} id={p.id} title={p.title} variantId={p.variantId} brandName={p.brand?.name} price={Number(p.price)} salePrice={p.salePrice ? Number(p.salePrice) : null} imageUrl={p.imageUrl} availability={p.availability} stockTotal={st} stock={p.stock} mpn={p.mpn} description={p.description} descriptionRu={p.descriptionRu} attributes={p.attributes} specifications={p.specifications} documents={p.documents} createdAt={p.createdAt} variant="list" />);
            })}</div>
          )}
          <Pagination page={page} totalPages={meta.totalPages} onChange={(pg) => { setPage(pg); updateUrl({ filters: activeFilters, page: pg }); }} />
        </section>
      </div>
      <style>{`
        .category-nav-card {
          transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
        }
        .category-nav-card:hover {
          border-color: var(--color-hair-strong) !important;
          box-shadow: var(--shadow-1);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 92,
        padding: '8px 10px',
        border: '1px solid var(--color-hair)',
        borderRadius: 8,
        background: 'var(--color-surface-2)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>
        {label}
      </div>
      <div style={{ marginTop: 2, fontSize: 13, fontWeight: 800, color: 'var(--color-ink)' }}>
        {value}
      </div>
    </div>
  );
}

const SORT_LABELS: Record<string, string> = {
  'relevance-desc': 'Лучшие',
  'createdAt-desc': 'Новые',
  'title-asc': 'По названию',
};

const viewToggleActive: React.CSSProperties = { background: 'var(--color-accent)', color: '#fff', border: 'none', width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const viewToggleBase: React.CSSProperties = { background: 'transparent', color: 'var(--color-ink-4)', border: 'none', width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
