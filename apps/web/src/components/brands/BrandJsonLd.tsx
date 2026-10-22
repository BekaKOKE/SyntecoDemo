import type { BrandConfig } from '@/config/brands/types';
import { safeJsonLd } from '@/lib/security/json-ld';

/**
 * JSON-LD Organization structured data for a brand page.
 * Improves SEO — Google can show brand info in rich results.
 */
export function BrandJsonLd({ brand }: { brand: BrandConfig }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    legalName: brand.legalName,
    url: `https://synteco.kz/brands/${brand.slug}`,
    logo: `https://synteco.kz${brand.logoUrl}`,
    foundingDate: String(brand.established),
    description: brand.taglineRu,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
