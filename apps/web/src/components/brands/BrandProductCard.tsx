'use client';

import { useState } from 'react';
import type { BrandProduct } from '@/config/brands/types';
import { QuoteModal } from '@/components/molecules/QuoteModal';

/** Inline icons — the reference design uses FA glyphs we don't ship. */
const IconQuote = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M12 3v4h4M7.5 11h5M7.5 14h3" strokeLinecap="round" />
  </svg>
);
const IconExternal = () => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M15 11v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4M12 3h5v5M17 3l-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPdf = () => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M11 2H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z" />
    <path d="M11 2v4h4" strokeLinejoin="round" />
    <path d="M7.5 13.5v-3h1.2a1 1 0 0 1 0 2H7.5m4 1v-3h1a1.5 1.5 0 0 1 0 3z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 20 20" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
    <path d="m10 2 7 4v8l-7 4-7-4V6z" />
    <path d="M3 6l7 4 7-4M10 10v8" />
  </svg>
);

/**
 * One manufacturer product card.
 *
 * Both outbound links are built from this product's own manufacturer id, so
 * they always resolve to *this* product — never to a category page.
 */
export function BrandProductCard({
  product,
  brandColor,
  brandName,
  priority = false,
}: {
  product: BrandProduct;
  brandColor: string;
  brandName: string;
  /** Above-the-fold card — fetch its photo at high priority. */
  priority?: boolean;
}) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <>
      <article className="pcard" style={{ '--brand-accent': brandColor } as React.CSSProperties}>
        <div className="pcard-img">
          {product.imageUrl && !imgFailed ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              /* Not loading="lazy": these cards mount into a subtree that
                 appears after page load, where Chrome's lazy-load observer
                 never re-evaluates them — the photos silently never download.
                 The grid is paginated and the thumbnails are small. */
              loading="eager"
              decoding="async"
              fetchPriority={priority ? 'high' : 'low'}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="pcard-ph">
              <IconBox />
              <span className="pcard-ph-brand">{product.brand.replace(/[®™]/g, '')}</span>
              <span className="pcard-ph-sku">{product.sku}</span>
            </span>
          )}
        </div>

        <div className="pcard-body">
          <div className="pcard-brand">{product.brand}</div>
          <h4 className="pcard-name">{product.name}</h4>
          <div className="pcard-sku">{product.sku}</div>
          {product.descriptionRu ? <p className="pcard-desc">{product.descriptionRu}</p> : null}
          {product.sizes || product.colors ? (
            <div className="pcard-spec">
              {product.sizes ? (
                <span>
                  <b>Размеры:</b> {product.sizes}
                </span>
              ) : null}
              {product.colors ? (
                <span>
                  <b>Цвет:</b> {product.colors}
                </span>
              ) : null}
              {product.variants && product.variants > 1 ? (
                <span>
                  <b>Исполнений:</b> {product.variants}
                </span>
              ) : null}
            </div>
          ) : null}
          {product.tags?.length ? (
            <div className="pcard-tags">
              {product.tags.slice(0, 4).map((t) => (
                <span className="pcard-tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pcard-footer">
          <button type="button" className="pcard-quote" onClick={() => setQuoteOpen(true)}>
            <IconQuote /> Запросить КП
          </button>
          <div className="pcard-links">
            <a
              href={product.manufacturerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pcard-link is-mfg"
              title={`${product.sku} — страница товара на сайте ${brandName}`}
            >
              <IconExternal /> Manufacturer
            </a>
            {product.datasheetUrl ? (
              <a
                href={product.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pcard-link is-ds"
                title={`${product.sku} — техпаспорт (PDF)`}
              >
                <IconPdf /> Datasheet
              </a>
            ) : null}
          </div>
        </div>
      </article>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{
          variantId: `PIP-${product.sku}`,
          title: `${product.brand} ${product.name} (${product.sku})`,
          brandName,
        }}
        qty={1}
        unitPrice={0}
      />
    </>
  );
}
