import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductServer } from '@/lib/api/products-server';
import type { Product } from '@/lib/api/products';
import ProductDetailClient from './ProductDetailClient';
import { safeJsonLd } from '@/lib/security/json-ld';

// Incremental Static Regeneration: pages are cached and refreshed every 5 min,
// so the catalog is crawlable and fast without a redeploy per product change.
export const revalidate = 300;

const SITE = 'https://synteco.kz';

/** Plain-text cleaner for meta descriptions (no JSX, server-safe). */
function toText(input: string | null | undefined, max = 300): string {
  if (!input) return '';
  const cleaned = input
    .replace(/<[^>]*>/g, ' ')
    .replace(/<(path|svg)\b[^<]*/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned.length > max ? cleaned.slice(0, max - 1).trimEnd() + '…' : cleaned;
}

// ── SEO metadata (title, description, canonical, Open Graph) ──
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductServer(id);
  if (!product) {
    return { title: 'Товар не найден', robots: { index: false, follow: true } };
  }

  const brand = product.brand?.name ? `${product.brand.name} · ` : '';
  const title = `${product.title} — ${brand}купить в Казахстане`;
  const description =
    toText(product.descriptionRu || product.description) ||
    `${product.title}. ${product.brand?.name ?? ''} SKU ${product.variantId}. Промышленное снабжение (MRO) с доставкой по Казахстану. Цены и наличие — по запросу.`;
  const canonical = `${SITE}/products/${product.id}`;
  const image = product.imageUrl || product.images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

// ── JSON-LD structured data (Product + Offer + Breadcrumb) ──
function ProductJsonLd({ product }: { product: Product }) {
  const category = product.categories?.[0]?.category;
  const availability =
    product.availability === 'in_stock'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.variantId,
    mpn: product.mpn ?? undefined,
    brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
    description: toText(product.descriptionRu || product.description) || undefined,
    image: product.imageUrl || product.images?.[0]?.url || undefined,
    url: `${SITE}/products/${product.id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KZT',
      price: product.price > 0 ? product.price : undefined,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE}/products/${product.id}`,
      seller: { '@type': 'Organization', name: 'Synteco' },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE}/products` },
      ...(category
        ? [{ '@type': 'ListItem', position: 3, name: category.name, item: `${SITE}/categories/${category.slug}` }]
        : []),
      { '@type': 'ListItem', position: category ? 4 : 3, name: product.title, item: `${SITE}/products/${product.id}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
    </>
  );
}

// ── Server page: fetch on the server, hand off to interactive client shell ──
export default async function ProductPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await getProductServer(id);
  if (!product) notFound(); // real 404 status for crawlers

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetailClient product={product} />
    </>
  );
}
