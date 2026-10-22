'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogSearchMatch } from '@/lib/catalog-search';
import { countCatalogLinks } from '@/lib/catalog-search';
import { SubcategoryTile } from '@/components/brands/SubcategoryTile';
import { Icons } from '@/lib/icons';

/**
 * «Каталоги официальных брендов» block on the /search page.
 *
 * For a query like «респираторы» shows matching manufacturer catalog
 * sections across ALL official brands (PIP Disposable Masks, uvex FFP,
 * Honeywell PPE, …) with the standard tiles: «Открыть каталог» (official site)
 * and «Запросить КП» (quote modal).
 */
export function CatalogSearchResults({ matches }: { matches: CatalogSearchMatch[] }) {
  if (matches.length === 0) return null;

  const brandCount = new Set(matches.map((m) => m.brandSlug)).size;
  const linkCount = countCatalogLinks(matches);

  return (
    <section className="catalog-search-results" aria-label="Каталоги официальных брендов">
      <div className="catalog-search-results-head">
        <div className="category-featured-catalog-kicker">
          <Icons.shield width={14} height={14} /> Каталоги официальных брендов
        </div>
        <p className="muted">
          Найдено в каталогах производителей: {brandCount}{' '}
          {brandCount === 1 ? 'бренд' : brandCount < 5 ? 'бренда' : 'брендов'} ·{' '}
          {linkCount} {linkCount === 1 ? 'раздел' : linkCount < 5 ? 'раздела' : 'разделов'}.
          Откройте каталог на официальном сайте или запросите КП — подберём и привезём под заказ.
        </p>
      </div>

      {matches.map((m) => (
        <article
          key={`${m.brandSlug}:${m.category.slug}`}
          className="catalog-search-group"
          style={{ '--brand-accent': m.brandColor } as React.CSSProperties}
        >
          <div className="brand-detail-brandbar">
            <span className="brand-detail-brand-logo">
              <Image src={m.logoUrl} alt={m.brandName} width={112} height={44} />
            </span>
            <div className="brand-detail-brand-meta">
              <div className="brand-detail-brand-name">
                {m.brandName} · {m.category.name}
              </div>
              {m.category.descriptionRu ? (
                <div className="brand-detail-brand-desc">{m.category.descriptionRu}</div>
              ) : null}
            </div>
            <div className="brand-detail-brand-links">
              <Link href={`/brands/${m.brandSlug}`} className="btn btn-secondary btn-sm">
                Страница бренда <Icons.arrow width={11} height={11} />
              </Link>
            </div>
          </div>
          {m.subcategories.length > 0 ? (
            <div className="brand-cat-grid">
              {m.subcategories.map((sub) => (
                <SubcategoryTile
                  key={sub.name}
                  sub={sub}
                  brandColor={m.brandColor}
                  brandName={m.brandName}
                  brandLogoUrl={m.logoUrl}
                />
              ))}
            </div>
          ) : (
            <div className="card brand-explorer-empty">
              <p className="muted">
                Смотрите ассортимент направления {m.category.name} на официальном сайте{' '}
                {m.brandName}.
              </p>
              <a href={m.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                Открыть сайт {m.brandName} <Icons.external width={12} height={12} />
              </a>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
