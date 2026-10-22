import { safeJsonLd } from '@/lib/security/json-ld';
/**
 * JSON-LD Structured Data components for SEO.
 * Renders <script type="application/ld+json"> with schema.org markup.
 */

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Synteco',
    alternateName: 'Synteco — Reliable Industrial Services',
    url: 'https://synteco.kz',
    logo: 'https://synteco.kz/logo.png',
    description: 'B2B платформа промышленного снабжения (MRO) в Казахстане. Промышленные товары, инструменты, крепёж, СИЗ, электрика с доставкой по Казахстану.',
    telephone: '+77024751703',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      name: 'Жасмин Толегенова',
      telephone: '+77024751703',
      email: 'j.tolegenova@synteco.kz',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Проспект Азаттық, д. 2',
      addressLocality: 'Атырау',
      addressCountry: 'KZ',
    },
    sameAs: [],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Synteco',
    url: 'https://synteco.kz',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://synteco.kz/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export function ProductJsonLd({ product }: { product: any }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.shortDescription,
    sku: product.variantId,
    mpn: product.mpn || undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    image: product.imageUrl || undefined,
    offers: {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: 'KZT',
      availability: product.availability === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://synteco.kz/products/${product.id}`,
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export function FaqJsonLd({ questions }: { questions: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
