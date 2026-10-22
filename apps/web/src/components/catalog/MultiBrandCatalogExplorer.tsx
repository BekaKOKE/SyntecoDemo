'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoryFeaturedBrand } from '@/config/category-featured-catalogs';
import { CategoryIcon } from '@/components/brands/BrandCatalogExplorer';
import { SubcategoryTile } from '@/components/brands/SubcategoryTile';
import { Icons } from '@/lib/icons';

/**
 * Multi-brand master-detail explorer for /categories/[slug].
 *
 * Sidebar: направления grouped per official brand (logo + name).
 * Detail: brand bar (logo, направление, links to the brand page and the
 * official site) + subcategory tiles that link out to the manufacturer.
 */
export function MultiBrandCatalogExplorer({ brands }: { brands: CategoryFeaturedBrand[] }) {
  const withCatalog = useMemo(() => brands.filter((b) => b.catalog.length > 0), [brands]);
  const first = withCatalog[0];

  // Desktop master-detail state: active brand + направление.
  const [active, setActive] = useState<{ brand: string; cat: string }>({
    brand: first?.brandSlug ?? '',
    cat: first?.catalog[0]?.slug ?? '',
  });
  // Which brand groups are expanded in the sidebar (first brand by default).
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(first ? [first.brandSlug] : []),
  );
  // Mobile state. The brand list itself is open on load (so the официальные
  // бренды are visible), but each brand's направления stay collapsed — that's
  // what used to make this block ~10 000px tall. The user can fold the whole
  // list away with the header button.
  const [mobileOpen, setMobileOpen] = useState(true);
  const [openBrand, setOpenBrand] = useState<string>('');
  // `${brandSlug}:${catSlug}` of the open направление card.
  const [openKey, setOpenKey] = useState<string>('');

  const toggleBrand = (brand: CategoryFeaturedBrand) => {
    const isOpen = expanded.has(brand.brandSlug);
    if (!isOpen) {
      // Expanding a brand also focuses its first направление in the detail pane.
      setActive({ brand: brand.brandSlug, cat: brand.catalog[0]?.slug ?? '' });
    }
    setExpanded((prev) => {
      const next = new Set(prev);
      if (isOpen) next.delete(brand.brandSlug);
      else next.add(brand.brandSlug);
      return next;
    });
  };

  const totalDirections = useMemo(
    () => withCatalog.reduce((sum, b) => sum + b.catalog.length, 0),
    [withCatalog],
  );

  const activeBrand = useMemo(
    () => withCatalog.find((b) => b.brandSlug === active.brand) ?? first,
    [withCatalog, active.brand, first],
  );
  const activeCategory = useMemo(
    () => activeBrand?.catalog.find((c) => c.slug === active.cat) ?? activeBrand?.catalog[0],
    [activeBrand, active.cat],
  );

  if (withCatalog.length === 0) return null;

  return (
    <section
      className="brand-explorer is-embedded multi-brand-explorer"
      style={{ '--brand-accent': activeBrand?.brandColor ?? 'var(--color-accent)' } as React.CSSProperties}
    >
      <div>
        {/* ── Desktop: master-detail (brand groups + active направление) ── */}
        <div className="brand-explorer-grid hide-mobile">
          <aside className="brand-explorer-nav">
            <div className="brand-explorer-nav-title">Бренды и направления</div>
            <div className="brand-explorer-nav-scroll">
              {withCatalog.map((brand) => {
                const isOpen = expanded.has(brand.brandSlug);
                const isActiveBrand = activeBrand?.brandSlug === brand.brandSlug;
                return (
                  <div
                    key={brand.brandSlug}
                    className={`brand-explorer-brand-group${isOpen ? ' is-open' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`brand-explorer-brand-head${isActiveBrand ? ' is-active' : ''}`}
                      style={{ '--brand-accent': brand.brandColor } as React.CSSProperties}
                      aria-expanded={isOpen}
                      title={isOpen ? `Свернуть ${brand.brandName}` : `Направления ${brand.brandName}`}
                    >
                      <span className="brand-explorer-brand-logo">
                        <Image src={brand.logoUrl} alt={brand.brandName} width={64} height={28} />
                      </span>
                      <span className="brand-explorer-brand-name">{brand.brandName}</span>
                      <span className="brand-explorer-nav-count">{brand.catalog.length}</span>
                      <span
                        className="brand-explorer-brand-chevron"
                        aria-hidden="true"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                      >
                        ▾
                      </span>
                    </button>
                    {isOpen ? (
                      <nav>
                        {brand.catalog.map((cat) => {
                          const isActive =
                            activeBrand?.brandSlug === brand.brandSlug &&
                            activeCategory?.slug === cat.slug;
                          return (
                            <button
                              type="button"
                              key={cat.slug}
                              onClick={() => setActive({ brand: brand.brandSlug, cat: cat.slug })}
                              className={`brand-explorer-nav-link${isActive ? ' is-active' : ''}`}
                              style={{ '--brand-accent': brand.brandColor } as React.CSSProperties}
                            >
                              <span className="brand-explorer-nav-icon">
                                <CategoryIcon name={cat.iconName} />
                              </span>
                              <span className="brand-explorer-nav-label">{cat.name}</span>
                              {cat.subcategories?.length ? (
                                <span className="brand-explorer-nav-count">
                                  {cat.subcategories.length}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </nav>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="brand-explorer-detail">
            {activeBrand && activeCategory ? (
              <article className="brand-cat-active">
                <div
                  className="brand-detail-brandbar"
                  style={{ '--brand-accent': activeBrand.brandColor } as React.CSSProperties}
                >
                  <span className="brand-detail-brand-logo">
                    <Image src={activeBrand.logoUrl} alt={activeBrand.brandName} width={112} height={44} />
                  </span>
                  <div className="brand-detail-brand-meta">
                    <div className="brand-detail-brand-name">
                      {activeBrand.brandName} · {activeCategory.name}
                    </div>
                    {activeCategory.descriptionRu ? (
                      <div className="brand-detail-brand-desc">{activeCategory.descriptionRu}</div>
                    ) : null}
                  </div>
                  <div className="brand-detail-brand-links">
                    <Link href={`/brands/${activeBrand.brandSlug}`} className="btn btn-secondary btn-sm">
                      Страница бренда <Icons.arrow width={11} height={11} />
                    </Link>
                    <a
                      href={activeBrand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Официальный сайт <Icons.external width={11} height={11} />
                    </a>
                  </div>
                </div>
                {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                  <div className="brand-cat-grid">
                    {activeCategory.subcategories.map((sub) => (
                      <SubcategoryTile
                        key={sub.name}
                        sub={sub}
                        brandColor={activeBrand.brandColor}
                        brandName={activeBrand.brandName}
                        brandLogoUrl={activeBrand.logoUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card brand-explorer-empty">
                    <p className="muted">
                      Подкатегории скоро появятся. Смотрите полный ассортимент направления{' '}
                      {activeCategory.name} на официальном сайте {activeBrand.brandName}.
                    </p>
                    <a
                      href={activeBrand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Открыть сайт {activeBrand.brandName} <Icons.external width={12} height={12} />
                    </a>
                  </div>
                )}
              </article>
            ) : null}
          </div>
        </div>

        {/* ── Mobile: two-level disclosure ──
             Every направление used to be rendered as an open card, which is
             how this block grew to ~10 000px of scroll on a phone. Now the
             whole thing is collapsed: направления → brand → категория →
             плитки, one open branch at a time. */}
        <div className="bcx-m show-mobile">
          <button
            type="button"
            className="bcx-m-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
          >
            <span>
              Направления брендов
              <span className="bcx-m-toggle-sub">
                {withCatalog.length} брендов · {totalDirections} направлений
              </span>
            </span>
            <span className="bcx-m-chev" aria-hidden="true" style={{ transform: mobileOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>

          {mobileOpen
            ? withCatalog.map((brand) => {
                const brandOpen = openBrand === brand.brandSlug;
                return (
                  <div
                    key={brand.brandSlug}
                    className={`bcx-m-brand${brandOpen ? ' is-open' : ''}`}
                    style={{ '--brand-accent': brand.brandColor } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      className="bcx-m-brand-head"
                      onClick={() => {
                        setOpenBrand(brandOpen ? '' : brand.brandSlug);
                        setOpenKey('');
                      }}
                      aria-expanded={brandOpen}
                    >
                      <span className="bcx-m-brand-logo">
                        <Image src={brand.logoUrl} alt={brand.brandName} width={64} height={28} />
                      </span>
                      <span className="bcx-m-brand-name">{brand.brandName}</span>
                      <span className="bcx-m-brand-count">{brand.catalog.length}</span>
                      <span className="bcx-m-brand-chev" aria-hidden="true" style={{ transform: brandOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </button>

                    {brandOpen ? (
                      <div className="bcx-m-brand-body">
                        {brand.catalog.map((cat) => {
                          const key = `${brand.brandSlug}:${cat.slug}`;
                          const isOpen = openKey === key;
                          const subCount = cat.subcategories?.length ?? 0;
                          return (
                            <div
                              key={key}
                              className={`brand-cat-card${isOpen ? ' is-open' : ''}`}
                              style={{ '--brand-accent': brand.brandColor } as React.CSSProperties}
                            >
                              <button
                                type="button"
                                className="brand-cat-card-head"
                                onClick={() => setOpenKey(isOpen ? '' : key)}
                                aria-expanded={isOpen}
                              >
                                <span className="brand-cat-card-icon">
                                  <CategoryIcon name={cat.iconName} />
                                </span>
                                <span className="brand-cat-card-meta">
                                  <span className="brand-cat-card-name">{cat.name}</span>
                                  {cat.descriptionRu && (
                                    <span className="brand-cat-card-desc">{cat.descriptionRu}</span>
                                  )}
                                  <span className="brand-cat-card-count">
                                    {subCount > 0
                                      ? `${subCount} подкатегори${subCount === 1 ? 'я' : subCount < 5 ? 'и' : 'й'}`
                                      : 'Нет подкатегорий'}
                                  </span>
                                </span>
                                <span className="brand-cat-card-toggle" aria-hidden="true">
                                  {isOpen ? 'Свернуть' : 'Смотреть'}
                                  <span
                                    className="brand-cat-card-chevron"
                                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                                  >
                                    ▾
                                  </span>
                                </span>
                              </button>
                              {isOpen && (
                                <div className="brand-cat-card-body">
                                  {subCount > 0 ? (
                                    <div className="brand-cat-grid">
                                      {cat.subcategories!.map((sub) => (
                                        <SubcategoryTile
                                          key={sub.name}
                                          sub={sub}
                                          brandColor={brand.brandColor}
                                          brandName={brand.brandName}
                                          brandLogoUrl={brand.logoUrl}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="brand-cat-card-empty">
                                      <p className="muted">
                                        Подкатегории скоро появятся. Смотрите полный ассортимент на сайте{' '}
                                        {brand.brandName}.
                                      </p>
                                      <a
                                        href={brand.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                      >
                                        Открыть {brand.brandName} <Icons.external width={12} height={12} />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <Link href={`/brands/${brand.brandSlug}`} className="bcx-m-brand-link">
                          Страница бренда {brand.brandName}
                          <Icons.arrow width={12} height={12} />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </section>
  );
}
