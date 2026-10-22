'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { QuoteModal } from '@/components/molecules/QuoteModal';
import { getBrandSlugByName } from '@/config/brands';
import { Icons } from '@/lib/icons';
import { formatPrice } from '@/lib/format';

type ProductDocument = {
  id?: string;
  name: string;
  url: string;
  type: string;
};

interface ProductCardProps {
  id: string;
  title: string;
  variantId?: string;
  brandName?: string;
  price: number;
  salePrice?: number | null;
  imageUrl: string | null;
  availability: string;
  stockTotal: number;
  stock?: Array<{ warehouseId: string; warehouse: { id: string; name: string; code: string }; quantity: number; reserved: number }>;
  mpn?: string | null;
  description?: string | null;
  descriptionRu?: string | null;
  attributes?: Record<string, string> | null;
  specifications?: Record<string, string> | null;
  documents?: ProductDocument[];
  createdAt?: string;
  featured?: boolean;
  variant?: 'grid' | 'list' | 'compact';
  /** Куда ведут фото и заголовок. По умолчанию — карточка товара в базе.
   *  Нужен для витринных позиций, которых в базе нет. */
  href?: string;
  className?: string;
  /** Kept for compatibility with older callers; quote is now the primary CTA. */
  onAddToCart?: () => void;
}

const URL_KEYS = ['url', 'ссылка', 'link', 'datasheet', 'manufacturer', 'pdf'];

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, max = 180) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

function cleanText(value: string | null | undefined) {
  if (!value) return '';
  return truncate(stripHtml(value), 210);
}

function isLikelyUrl(key: string, value: string) {
  const k = key.toLowerCase();
  const v = value.toLowerCase();
  return URL_KEYS.some(part => k.includes(part)) || v.startsWith('http://') || v.startsWith('https://');
}

function getProductTags(attributes?: Record<string, string> | null, specifications?: Record<string, string> | null) {
  const entries = Object.entries({ ...(specifications ?? {}), ...(attributes ?? {}) });
  const priority = [
    'стандарт', 'standard', 'ansi', 'class', 'класс', 'тип', 'type', 'материал', 'material',
    'размер', 'size', 'nrr', 'защита', 'protection', 'напряжение', 'voltage',
  ];
  const seen = new Set<string>();

  return entries
    .filter(([key, value]) => value && !isLikelyUrl(key, String(value)))
    .sort(([a], [b]) => {
      const ai = priority.findIndex(part => a.toLowerCase().includes(part));
      const bi = priority.findIndex(part => b.toLowerCase().includes(part));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map(([key, value]) => {
      const text = String(value).trim();
      if (!text || text.length > 34) return '';
      const lowerKey = key.toLowerCase();
      if (['тип', 'type', 'класс', 'class', 'стандарт', 'standard'].some(part => lowerKey.includes(part))) {
        return text;
      }
      return text;
    })
    .filter(tag => {
      if (!tag || seen.has(tag.toLowerCase())) return false;
      seen.add(tag.toLowerCase());
      return true;
    })
    .slice(0, 5);
}

function findUrlByKey(attributes: Record<string, string> | null | undefined, keys: string[]) {
  const entry = Object.entries(attributes ?? {}).find(([key, value]) => {
    const lower = key.toLowerCase();
    return value && value.startsWith('http') && keys.some(part => lower.includes(part));
  });
  return entry?.[1];
}

function getProductLinks(documents?: ProductDocument[], attributes?: Record<string, string> | null) {
  const datasheetDoc = documents?.find(doc => {
    const text = `${doc.type} ${doc.name}`.toLowerCase();
    return text.includes('datasheet') || text.includes('spec') || text.includes('pdf') || text.includes('паспорт');
  });
  const manufacturerDoc = documents?.find(doc => {
    const text = `${doc.type} ${doc.name}`.toLowerCase();
    return text.includes('manufacturer') || text.includes('mfg') || text.includes('производ');
  });

  return {
    manufacturerUrl: manufacturerDoc?.url ?? findUrlByKey(attributes, ['manufacturer', 'mfg', 'производ']),
    datasheetUrl: datasheetDoc?.url ?? findUrlByKey(attributes, ['datasheet', 'spec', 'pdf', 'паспорт']),
  };
}

/**
 * Resolve the two action links with fallbacks so the buttons are always
 * meaningful (never dead). Priority:
 *   manufacturer: DB url → /brands/[slug] (if official) → /products/[id]
 *   datasheet:    DB url → /products/[id]
 */
function resolveLinks(
  productId: string,
  brandName?: string,
  documents?: ProductDocument[],
  attributes?: Record<string, string> | null,
) {
  const raw = getProductLinks(documents, attributes);
  const productHref = `/products/${productId}`;
  const brandSlug = brandName ? getBrandSlugByName(brandName) : undefined;
  return {
    manufacturerUrl: raw.manufacturerUrl ?? (brandSlug ? `/brands/${brandSlug}` : productHref),
    datasheetUrl: raw.datasheetUrl ?? productHref,
    manufacturerExternal: Boolean(raw.manufacturerUrl),
  };
}

const FEATURED_BRANDS = [
  '3m',
  'ansul',
  'honeywell',
  'pip',
  'uvex',
  'parker',
  'smc',
  'milwaukee',
  'westward',
  'master lock',
];

const QUALITY_FEATURED_BRANDS = [
  'carrier',
  'norton',
  'leviton',
  'burndy',
  'hobart',
  'porter cable',
];

function stableBucket(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % 100;
}

function isNew(createdAt: string | undefined, id: string) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return ageDays >= 0 && ageDays <= 21 && stableBucket(`${id}:new`) < 8;
}

function isFeaturedProduct({
  id,
  variantId,
  title,
  brandName,
  imageUrl,
  price,
  availability,
  stockTotal,
}: {
  id: string;
  variantId?: string;
  title: string;
  brandName?: string;
  imageUrl: string | null;
  price: number;
  availability: string;
  stockTotal: number;
}) {
  if (!imageUrl || price <= 0) return false;

  const brand = (brandName ?? '').trim().toLowerCase();
  const hasCuratedBrand = FEATURED_BRANDS.some(item => brand.includes(item));
  const hasQualityBrand = QUALITY_FEATURED_BRANDS.some(item => brand.includes(item));
  const inStock = availability === 'in_stock' && stockTotal > 0;
  const limit = hasCuratedBrand ? (inStock ? 55 : 22) : hasQualityBrand ? (inStock ? 16 : 8) : (inStock ? 4 : 1);

  return stableBucket(`${brand}:${variantId ?? id}:${title}:featured`) < limit;
}

function PriceTag({ price, salePrice, size = 16 }: { price: number; salePrice?: number | null; size?: number }) {
  const current = Number(salePrice ?? price) || 0;
  if (current <= 0) return null;
  const old = salePrice != null && Number(price) > current ? Number(price) : null;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
      <span className="num" style={{ fontSize: size, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.01em' }}>{formatPrice(current)}</span>
      {old ? <span className="num" style={{ fontSize: 11, color: 'var(--color-ink-4)', textDecoration: 'line-through' }}>{formatPrice(old)}</span> : null}
    </div>
  );
}

function ProductImage({ id, title, imageUrl, variantId, badge, href }: {
  id: string;
  title: string;
  imageUrl: string | null;
  variantId?: string;
  badge?: { label: string; tone: 'new' | 'featured' | 'sale' };
  href?: string;
}) {
  return (
    <Link href={href ?? `/products/${id}`} className="b2b-product-media">
      {badge ? <span className={`b2b-product-badge ${badge.tone}`}>{badge.label}</span> : null}
      {imageUrl ? (
        <img src={imageUrl} alt={title} loading="lazy" />
      ) : (
        <div className="b2b-product-placeholder">
          <span>{variantId}</span>
        </div>
      )}
    </Link>
  );
}

export function ProductCard({
  id,
  title,
  variantId,
  brandName,
  price,
  salePrice,
  imageUrl,
  availability,
  stockTotal,
  stock,
  mpn,
  description,
  descriptionRu,
  attributes,
  specifications,
  documents,
  createdAt,
  featured,
  variant = 'grid',
  href,
  className = '',
}: ProductCardProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const inStock = availability === 'in_stock' && stockTotal > 0;
  const quotePrice = Number(salePrice ?? price ?? 0);
  const summary = cleanText(descriptionRu || description);
  const tags = useMemo(() => getProductTags(attributes, specifications), [attributes, specifications]);
  const links = useMemo(
    () => resolveLinks(id, brandName, documents, attributes),
    [id, brandName, documents, attributes],
  );
  const autoFeatured = featured ?? isFeaturedProduct({
    id,
    variantId,
    title,
    brandName,
    imageUrl,
    price: quotePrice,
    availability,
    stockTotal,
  });
  const badge = salePrice
    ? { label: 'SALE', tone: 'sale' as const }
    : autoFeatured
      ? { label: 'FEATURED', tone: 'featured' as const }
      : isNew(createdAt, id)
        ? { label: 'NEW', tone: 'new' as const }
        : undefined;

  const quoteProduct = {
    variantId: variantId || mpn || id,
    title,
    brandName,
  };

  if (variant === 'list') {
    return (
      <>
        <div className={`card product-row b2b-product-card list ${className}`}>
          <ProductImage id={id} title={title} imageUrl={imageUrl} variantId={variantId} badge={badge} href={href} />
          <div className="b2b-product-info">
            {brandName ? <div className="b2b-product-brand">{brandName}</div> : null}
            <Link href={href ?? `/products/${id}`} className="b2b-product-title">{title}</Link>
            <div className="b2b-product-sku">SKU: {variantId || 'по запросу'}{mpn ? ` · MPN: ${mpn}` : ''}</div>
            {summary ? <p className="b2b-product-desc">{summary}</p> : null}
            {tags.length ? <div className="b2b-product-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div> : null}
          </div>
          <div className="b2b-product-side">
            <PriceTag price={price} salePrice={salePrice} size={17} />
            <span className={inStock ? 'pill ok' : 'pill warn'}><span className="dot" />{inStock ? `${stockTotal} в наличии` : 'Под заказ'}</span>
            {stock?.[0] ? <div className="mono muted" style={{ fontSize: 11 }}>{stock[0].warehouse.name}</div> : null}
            <button type="button" onClick={() => setQuoteOpen(true)} className="btn btn-primary btn-sm b2b-quote-btn">Запросить КП</button>
            <div className="b2b-product-links">
              <a
                href={links.manufacturerUrl}
                {...(links.manufacturerExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="mfg-btn"
              >
                <Icons.external width={12} height={12} /> Производитель
              </a>
              <a
                href={links.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ds-btn"
              >
                <Icons.docText width={12} height={12} /> Datasheet
              </a>
            </div>
          </div>
        </div>
        <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} product={quoteProduct} qty={1} unitPrice={quotePrice} />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <div className={`card b2b-product-card compact ${className}`}>
          <ProductImage id={id} title={title} imageUrl={imageUrl} variantId={variantId} badge={badge} href={href} />
          <div className="b2b-product-info">
            {brandName ? <div className="b2b-product-brand">{brandName}</div> : null}
            <Link href={href ?? `/products/${id}`} className="b2b-product-title">{title}</Link>
            <div className="b2b-product-sku">SKU: {variantId || 'по запросу'}</div>
            {tags.length ? <div className="b2b-product-tags compact-tags">{tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div> : null}
            <PriceTag price={price} salePrice={salePrice} size={15} />
            <button type="button" onClick={() => setQuoteOpen(true)} className="btn btn-primary btn-sm b2b-quote-btn">Запросить КП</button>
          </div>
        </div>
        <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} product={quoteProduct} qty={1} unitPrice={quotePrice} />
      </>
    );
  }

  return (
    <>
      <div className={`card b2b-product-card ${className}`}>
        <ProductImage id={id} title={title} imageUrl={imageUrl} variantId={variantId} badge={badge} href={href} />
        <div className="b2b-product-info">
          {brandName ? <div className="b2b-product-brand">{brandName}</div> : null}
          <Link href={href ?? `/products/${id}`} className="b2b-product-title">{title}</Link>
          <div className="b2b-product-sku">
            SKU: {variantId || 'по запросу'}
            {mpn ? <span className="b2b-product-mpn"> · MPN: {mpn}</span> : null}
          </div>
          {summary ? <p className="b2b-product-desc">{summary}</p> : null}
          {tags.length ? <div className="b2b-product-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div> : null}
        </div>
        <div className="b2b-product-footer">
          <PriceTag price={price} salePrice={salePrice} />
          <button type="button" onClick={() => setQuoteOpen(true)} className="btn btn-primary btn-sm b2b-quote-btn">Запросить КП</button>
          <div className="b2b-product-links">
            <a
              href={links.manufacturerUrl}
              {...(links.manufacturerExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="mfg-btn"
            >
              <Icons.external width={12} height={12} /> Производитель
            </a>
            <a
              href={links.datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn"
            >
              <Icons.docText width={12} height={12} /> Datasheet
            </a>
          </div>
        </div>
      </div>
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} product={quoteProduct} qty={1} unitPrice={quotePrice} />
    </>
  );
}
