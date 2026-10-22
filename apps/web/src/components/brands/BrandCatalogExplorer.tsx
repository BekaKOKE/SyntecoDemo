'use client';

import { useMemo, useState } from 'react';
import type { BrandCatalogCategory } from '@/config/brands/types';
import { Icons } from '@/lib/icons';
import { SubcategoryTile } from './SubcategoryTile';
import { BrandProductGrid } from './BrandProductGrid';

interface BrandCatalogExplorerProps {
  brandName: string;
  brandColor: string;
  website: string;
  catalog: BrandCatalogCategory[];
  embedded?: boolean;
  navTitle?: string;
}

type IconName = 'package' | 'shield' | 'wrench' | 'warning' | 'lock';

export function CategoryIcon({ name }: { name?: string }) {
  switch (name as IconName) {
    case 'package':
      return <Icons.package width={18} height={18} />;
    case 'wrench':
      return <Icons.wrench width={18} height={18} />;
    case 'warning':
      return <Icons.warning width={18} height={18} />;
    case 'lock':
      return <Icons.lock width={18} height={18} />;
    case 'shield':
    default:
      return <Icons.shield width={18} height={18} />;
  }
}

/**
 * How many distinct products we have mirrored for a category.
 *
 * De-duplicated by `pid` — the manufacturer cross-lists some products under
 * several subcategories, and the sidebar badge must match what the grid
 * actually shows for that category.
 */
function productCount(cat: BrandCatalogCategory): number {
  const seen = new Set<string>();
  for (const sub of cat.subcategories ?? []) {
    for (const p of sub.products ?? []) seen.add(p.pid);
  }
  return seen.size;
}

export function BrandCatalogExplorer({
  brandName,
  brandColor,
  website,
  catalog,
  embedded = false,
  navTitle = 'Categories',
}: BrandCatalogExplorerProps) {
  // Desktop master-detail state. Open on the first category that actually has
  // products, so the page lands on merchandise rather than on an empty shell.
  const firstWithProducts = catalog.find((c) => productCount(c) > 0) ?? catalog[0];
  const [activeSlug, setActiveSlug] = useState<string>(firstWithProducts?.slug ?? '');
  // Mobile accordion state — everything collapsed on load. Expanding the
  // first category by default pushed the rest of the page a screenful down
  // and made the block read as an endless list.
  const [openSlug, setOpenSlug] = useState<string>('');

  const activeCategory = useMemo(
    () => catalog.find((c) => c.slug === activeSlug) ?? catalog[0],
    [catalog, activeSlug],
  );

  /**
   * A category we have mirrored renders its products straight away; one we
   * haven't falls back to subcategory tiles that link out to the manufacturer.
   */
  const renderCategory = (cat: BrandCatalogCategory) => {
    if (productCount(cat) > 0) {
      return (
        <BrandProductGrid
          subcategories={cat.subcategories ?? []}
          brandColor={brandColor}
          brandName={brandName}
          categoryName={cat.name}
        />
      );
    }
    if (cat.subcategories?.length) {
      return (
        <div className="brand-cat-grid">
          {cat.subcategories.map((sub) => (
            <SubcategoryTile key={sub.name} sub={sub} brandColor={brandColor} brandName={brandName} />
          ))}
        </div>
      );
    }
    return (
      <div className="card brand-explorer-empty">
        <p className="muted">
          Subcategories coming soon. Browse the full {cat.name} range on the official site.
        </p>
        <a href={website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          Open {brandName} site <Icons.external width={12} height={12} />
        </a>
      </div>
    );
  };

  return (
    <section
      className={`brand-explorer${embedded ? ' is-embedded' : ''}`}
      style={{ '--brand-accent': brandColor } as React.CSSProperties}
    >
      <div className={embedded ? undefined : 'container-site'}>
        {/* ── Desktop: master-detail (sidebar + active category) ── */}
        <div className="brand-explorer-grid hide-mobile">
          <aside className="brand-explorer-nav">
            <div className="brand-explorer-nav-title">{navTitle}</div>
            <nav>
              {catalog.map((cat) => {
                const products = productCount(cat);
                return (
                  <button
                    type="button"
                    key={cat.slug}
                    onClick={() => setActiveSlug(cat.slug)}
                    className={`brand-explorer-nav-link${
                      activeCategory?.slug === cat.slug ? ' is-active' : ''
                    }`}
                  >
                    <span className="brand-explorer-nav-icon">
                      <CategoryIcon name={cat.iconName} />
                    </span>
                    <span className="brand-explorer-nav-label">{cat.name}</span>
                    {products || cat.subcategories?.length ? (
                      <span className="brand-explorer-nav-count">
                        {products || cat.subcategories!.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-block brand-explorer-nav-cta"
            >
              Open {brandName} site <Icons.external width={12} height={12} />
            </a>
          </aside>

          <div className="brand-explorer-detail">
            {activeCategory ? (
              <article className="brand-cat-active">
                {/* No category header here on purpose: the detail pane looked
                    the way it does on every other brand page before the PIP
                    product grid existed, and it stays that way. */}
                {renderCategory(activeCategory)}
              </article>
            ) : (
              <div className="card brand-explorer-empty">
                <p className="muted">No categories available.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile: expandable category cards ── */}
        <div className="brand-cat-accordion show-mobile">
          {catalog.map((cat) => {
            const isOpen = openSlug === cat.slug;
            const products = productCount(cat);
            const subCount = cat.subcategories?.length ?? 0;
            return (
              <div key={cat.slug} className={`brand-cat-card${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="brand-cat-card-head"
                  onClick={() => setOpenSlug(isOpen ? '' : cat.slug)}
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
                      {products > 0
                        ? `${products} товар${products % 10 === 1 && products % 100 !== 11 ? '' : (products % 10 >= 2 && products % 10 <= 4 && (products % 100 < 12 || products % 100 > 14)) ? 'а' : 'ов'}`
                        : subCount > 0
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
                {isOpen && <div className="brand-cat-card-body">{renderCategory(cat)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
