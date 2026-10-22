'use client';

import { useState } from 'react';
import type { BrandCatalogSubcategory } from '@/config/brands/types';
import { Icons } from '@/lib/icons';
import { QuoteModal } from '@/components/molecules/QuoteModal';

export function formatProductCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const suffix =
    mod10 === 1 && mod100 !== 11
      ? 'товар'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'товара'
        : 'товаров';

  return `${count} ${suffix}`;
}

export function SubcategoryTile({
  sub,
  brandColor,
  brandName,
  brandLogoUrl,
}: {
  sub: BrandCatalogSubcategory;
  brandColor: string;
  brandName: string;
  /** When set, a small brand badge (logo + name) is shown on the tile. */
  brandLogoUrl?: string;
}) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const categoryId = sub.url.match(/[?&]ccID=(\d+)/)?.[1] ?? sub.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-');

  return (
    <>
      <article className="brand-cat-tile" style={{ '--brand-accent': brandColor } as React.CSSProperties}>
        <a
          href={sub.url}
          target="_blank"
          rel="noopener noreferrer"
          className="brand-cat-tile-img"
          title={`${sub.name} — открыть в официальном каталоге ${brandName}`}
        >
          {brandLogoUrl ? (
            <span className="brand-cat-tile-brand" title={brandName}>
              <img src={brandLogoUrl} alt={brandName} loading="lazy" />
            </span>
          ) : null}
          {sub.thumbnailUrl ? (
            <img
              src={sub.thumbnailUrl}
              alt={sub.name}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="brand-cat-tile-ph">
              <Icons.package width={34} height={34} />
            </span>
          )}
        </a>
        <div className="brand-cat-tile-body">
          <div className="brand-cat-tile-name">{sub.name}</div>
          {sub.products?.length ? (
            <div className="brand-cat-tile-count">
              {formatProductCount(sub.products.length)}
            </div>
          ) : typeof sub.productCount === 'number' ? (
            <div className="brand-cat-tile-count">
              {formatProductCount(sub.productCount)}
            </div>
          ) : null}
          <div className="brand-cat-tile-actions">
            <a href={sub.url} target="_blank" rel="noopener noreferrer" className="brand-cat-tile-cta">
              Открыть каталог <Icons.external width={11} height={11} />
            </a>
            <button type="button" className="btn btn-primary btn-sm brand-cat-quote-btn" onClick={() => setQuoteOpen(true)}>
              Запросить КП <Icons.arrow width={12} height={12} />
            </button>
          </div>
        </div>
      </article>
      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ variantId: `${brandName.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}-CAT-${categoryId}`, title: sub.name, brandName }}
        qty={1}
        unitPrice={0}
      />
    </>
  );
}
