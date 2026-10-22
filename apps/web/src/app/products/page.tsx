import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';
import { safeJsonLd } from '@/lib/security/json-ld';

const SITE = 'https://synteco.kz';

export const metadata: Metadata = {
  title: 'Каталог промышленного снабжения (MRO)',
  description:
    'Полный каталог Synteco: инструменты, крепёж, СИЗ, электрика, подшипники, сварка, ' +
    'пневматика, гидравлика и другое. Промышленное снабжение (MRO) с доставкой по Казахстану.',
  alternates: { canonical: `${SITE}/products` },
  openGraph: {
    title: 'Каталог промышленного снабжения (MRO) — Synteco',
    description: 'Инструменты, крепёж, СИЗ, электрика, подшипники и другое. Доставка по Казахстану.',
    url: `${SITE}/products`,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

function CatalogJsonLd() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE}/products` },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
  );
}

export default function CatalogPage() {
  return (
    <>
      <CatalogJsonLd />
      <CatalogClient />
    </>
  );
}
