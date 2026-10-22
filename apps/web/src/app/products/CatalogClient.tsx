'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProducts, getFacets, type Product, type FacetsResponse } from '@/lib/api/products';
import { Icons } from '@/lib/icons';
import { useCart } from '@/lib/context/cart-context';
import { flyToCart } from '@/components/molecules/CartFly';
import { FilterSidebar, type ActiveFilters } from '@/components/molecules/FilterSidebar';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Pagination } from '@/components/ui/Pagination';

import { FilterChips } from '@/components/molecules/FilterChips';

const CATALOG_SORT_LABELS: Record<string, string> = {
  'relevance-desc': 'Лучшие',
  'createdAt-desc': 'Новые',
  'title-asc': 'По названию',
};

function fmtKZT(n: number) { return n.toLocaleString('ru-RU') + ' ₸'; }

function CatalogPageInner() {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<FacetsResponse | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 24, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'relevance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>((searchParams.get('sortDir') as 'asc' | 'desc') ?? 'desc');

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
      industry: searchParams.get('industry') ?? undefined,
    };
  });
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
  // Mobile drawer: the sidebar is hidden below 1023px, so without this the
  // catalog had no filters at all on a phone.
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // Rendered into <body>: see the same note in CategoryDetailClient.
  const [portalReady, setPortalReady] = useState(false);
  const [barVisible, setBarVisible] = useState(false);

  const categorySlug = searchParams.get('categorySlug') ?? undefined;
  const advisorCondition = searchParams.get('condition') ?? undefined;

  useEffect(() => {
    getFacets({ categorySlug }).then(setFacets).catch(() => {});
  }, [categorySlug]);

  const updateUrl = useCallback((next: { filters: ActiveFilters; page: number }) => {
    const params = new URLSearchParams();
    if (next.filters.minPrice !== undefined) params.set('minPrice', String(next.filters.minPrice));
    if (next.filters.maxPrice !== undefined) params.set('maxPrice', String(next.filters.maxPrice));
    if (next.filters.brandId) params.set('brand', next.filters.brandId);
    if (Object.keys(next.filters.attributes).length > 0) params.set('attr', JSON.stringify(next.filters.attributes));
    if (next.filters.warehouseId) params.set('warehouseId', next.filters.warehouseId);
    if (next.filters.inStockOnly) params.set('inStock', 'true');
    if (next.filters.industry) params.set('industry', next.filters.industry);
    if (categorySlug) params.set('categorySlug', categorySlug);
    if (advisorCondition) params.set('condition', advisorCondition);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    if (sortDir !== 'desc') params.set('sortDir', sortDir);
    if (next.page > 1) params.set('page', String(next.page));
    router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }, [pathname, router, sortBy, sortDir, categorySlug, advisorCondition]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getProducts({ page, limit: meta.limit, sortBy, sortDir, categorySlug, brandId: activeFilters.brandId, minPrice: activeFilters.minPrice, maxPrice: activeFilters.maxPrice, warehouseId: activeFilters.warehouseId, inStockOnly: activeFilters.inStockOnly || undefined })
      .then((r: any) => { setProducts(r.data); setMeta(r.meta); setLoading(false); }).catch(() => setLoading(false));
  }, [page, meta.limit, sortBy, sortDir, categorySlug, activeFilters.brandId, activeFilters.minPrice, activeFilters.maxPrice, activeFilters.warehouseId, activeFilters.inStockOnly]);

  useEffect(() => { const t = setTimeout(fetchProducts, 200); return () => clearTimeout(t); }, [fetchProducts]);

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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileFilterOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  const handleFilterChange = (next: ActiveFilters) => { setActiveFilters(next); setPage(1); updateUrl({ filters: next, page: 1 }); };
  const handleReset = () => {
    const empty: ActiveFilters = { attributes: {}, inStockOnly: false };
    setActiveFilters(empty);
    setPage(1);
    router.replace(pathname, { scroll: false });
  };
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => { const parts = e.target.value.split('-'); setSortBy(parts[0] || 'relevance'); setSortDir((parts[1] as 'asc' | 'desc') || 'desc'); };
  const activeFilterCount =
    Object.values(activeFilters.attributes).reduce((sum, v) => sum + v.length, 0)
    + (activeFilters.brandId ? 1 : 0)
    + (activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined ? 1 : 0)
    + (activeFilters.warehouseId ? 1 : 0)
    + (activeFilters.inStockOnly ? 1 : 0);

  return (
    <div className="container-site has-catalog-bar" style={{ padding: '24px 24px' }}>
      <section className="catalog-intro">
        <div style={{ minWidth: 0 }}>
          <div className="catalog-intro-eyebrow">Каталог Synteco</div>
          <h1>Каталог товаров</h1>
          <p>
            Промышленные товары, СИЗ, пожарная безопасность, LOTO и MRO-позиции для B2B-закупок.
            Используйте фильтры или отправьте запрос менеджеру.
          </p>
        </div>
        <div className="catalog-intro-actions">
          <Link href="/contacts" className="btn btn-primary">
            Запросить КП <Icons.arrow />
          </Link>
          <Link href="/brands" className="btn btn-secondary">
            Бренды
          </Link>
        </div>
      </section>

      {portalReady ? createPortal((
      <div className="show-mobile">
        <div className={`mobile-catalog-bar${barVisible ? '' : ' is-hidden'}`}>
          <button type="button" className="mcb-btn" onClick={() => setMobileFilterOpen(true)}>
            <Icons.filter />
            <span>Фильтры</span>
            {activeFilterCount > 0 ? <span className="mcb-count">{activeFilterCount}</span> : null}
          </button>
          <span className="mcb-divider" aria-hidden="true" />
          <span className="mcb-btn">
            <Icons.list />
            <span>{CATALOG_SORT_LABELS[`${sortBy}-${sortDir}`] ?? 'Сортировка'}</span>
            <select value={`${sortBy}-${sortDir}`} onChange={handleSort} aria-label="Сортировка">
              <option value="relevance-desc">Сначала лучшие</option>
              <option value="createdAt-desc">Новые</option>
              <option value="title-asc">По названию</option>
            </select>
          </span>
        </div>
        {mobileFilterOpen && (
          <div className="mobile-filter-shell" role="dialog" aria-modal="true" aria-label="Фильтры каталога">
            <button className="mobile-filter-backdrop" aria-label="Закрыть фильтры" onClick={() => setMobileFilterOpen(false)} />
            <aside className="mobile-filter-panel">
              <div className="mobile-filter-header">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-ink)' }}>Фильтры</div>
                  <div className="muted" style={{ marginTop: 2, fontSize: 11 }}>Каталог товаров</div>
                </div>
                <button onClick={() => setMobileFilterOpen(false)} className="mobile-filter-close" aria-label="Закрыть фильтры">
                  <Icons.close />
                </button>
              </div>
              <div className="mobile-filter-content">
                <FilterSidebar facets={facets} active={activeFilters} onChange={handleFilterChange} onReset={handleReset} />
              </div>
              <div className="mobile-filter-footer">
                <button className="btn btn-secondary btn-sm" onClick={handleReset} disabled={activeFilterCount === 0} style={{ height: 42, opacity: activeFilterCount === 0 ? 0.45 : 1 }}>
                  Сбросить
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setMobileFilterOpen(false)} style={{ height: 42, flex: 1 }}>
                  {loading ? 'Обновляем выдачу...' : `Показать ${meta.total.toLocaleString('ru-RU')} товаров`}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
      ), document.body) : null}

      <div className="layout-sidebar">
        <aside className="hide-mobile"><FilterSidebar facets={facets} active={activeFilters} onChange={handleFilterChange} onReset={handleReset} /></aside>
        <section>
          <div className="card catalog-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: 13 }}>{loading ? '…' : `${meta.total.toLocaleString('ru-RU')} товаров`}</span>
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
          <FilterChips active={activeFilters} facets={facets} onRemove={(next) => { setActiveFilters(next); updateUrl({ filters: next, page: 1 }); }} onReset={handleReset} />
          {loading ? (<div className={view === 'grid' ? 'grid-3' : ''} style={{ gap: view === 'grid' ? 16 : 8 }}>{Array.from({ length: 6 }, (_, i) => (<div key={i} className="card" style={{ height: 300, background: 'var(--color-surface-2)' }} />))}</div>)
          : products.length === 0 ? (<div className="card" style={{ padding: 40, textAlign: 'center' }}><p style={{ fontSize: 16, color: 'var(--color-ink-3)' }}>Ничего не найдено</p><button onClick={handleReset} className="btn btn-primary" style={{ marginTop: 16 }}>Сбросить фильтры</button></div>)
          : view === 'grid' ? (<div className="grid-3" style={{ gap: 16 }}>{products.map((p: Product) => {
            const st = p.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
            return (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                variantId={p.variantId}
                brandName={p.brand?.name}
                price={Number(p.price)}
                salePrice={p.salePrice ? Number(p.salePrice) : null}
                imageUrl={p.imageUrl}
                availability={p.availability}
                stockTotal={st}
                mpn={p.mpn}
                description={p.description}
                descriptionRu={p.descriptionRu}
                attributes={p.attributes}
                specifications={p.specifications}
                documents={p.documents}
                createdAt={p.createdAt}
                variant="grid"
                onAddToCart={() => { if (p.imageUrl) flyToCart(document.activeElement as HTMLElement, p.imageUrl); }}
              />
            );
          })}</div>)
          : (<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{products.map((p: Product) => {
            const st = p.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
            return (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                variantId={p.variantId}
                brandName={p.brand?.name}
                price={Number(p.price)}
                salePrice={p.salePrice ? Number(p.salePrice) : null}
                imageUrl={p.imageUrl}
                availability={p.availability}
                stockTotal={st}
                stock={p.stock}
                mpn={p.mpn}
                description={p.description}
                descriptionRu={p.descriptionRu}
                attributes={p.attributes}
                specifications={p.specifications}
                documents={p.documents}
                createdAt={p.createdAt}
                variant="list"
              />
            );
          })}</div>)}
          <Pagination page={page} totalPages={meta.totalPages} onChange={(pg) => { setPage(pg); updateUrl({ filters: activeFilters, page: pg }); }} />
        </section>
      </div>
    </div>
  );
}

export default function CatalogClient() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>}>
      <CatalogPageInner />
    </Suspense>
  );
}

const viewToggleActive: React.CSSProperties = { background: 'var(--color-accent)', color: '#fff', border: 'none', width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const viewToggleBase: React.CSSProperties = { background: 'transparent', color: 'var(--color-ink-4)', border: 'none', width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
