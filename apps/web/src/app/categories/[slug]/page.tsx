import type { Metadata } from 'next';
import { getCategoryServer } from '@/lib/api/categories-server';
import CategoryDetailClient from './CategoryDetailClient';
import { safeJsonLd } from '@/lib/security/json-ld';

// ISR — category pages refresh every 10 minutes.
export const revalidate = 600;

const SITE = 'https://synteco.kz';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryServer(slug);

  const name = category?.name ?? 'Категория';
  const title = `${name} — купить в Казахстане`;
  const count = category?.productCount ? ` (${category.productCount} позиций)` : '';
  const description =
    `${name}${count} — промышленное снабжение (MRO) от Synteco. ` +
    `Доставка по Казахстану, цены и наличие по запросу, работа с юрлицами и ЭДО.`;
  const canonical = `${SITE}/categories/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    // Don't index a category the API doesn't recognise (avoids thin/empty pages).
    robots: { index: Boolean(category), follow: true },
  };
}

function CategoryJsonLd({ slug, name }: { slug: string; name: string }) {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE}/products` },
      { '@type': 'ListItem', position: 3, name, item: `${SITE}/categories/${slug}` },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: `${SITE}/categories/${slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Synteco', url: SITE },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }} />
    </>
  );
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const category = await getCategoryServer(slug);

  return (
    <>
      <CategoryJsonLd slug={slug} name={category?.name ?? slug} />
      <CategoryDetailClient />
    </>
  );
}
