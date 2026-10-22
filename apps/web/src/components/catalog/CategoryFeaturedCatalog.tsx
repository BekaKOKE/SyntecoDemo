import Image from 'next/image';
import Link from 'next/link';
import { MultiBrandCatalogExplorer } from '@/components/catalog/MultiBrandCatalogExplorer';
import type { CategoryFeaturedCatalogConfig } from '@/config/category-featured-catalogs';
import { Icons } from '@/lib/icons';

/**
 * "Официальные бренды" block at the top of a category page.
 * Header: brand logo chips (link to /brands/[slug]) + counters.
 * Body: MultiBrandCatalogExplorer — направления grouped by brand, all
 * subcategory links go to the manufacturers' official sites.
 */
export function CategoryFeaturedCatalog({ config }: { config: CategoryFeaturedCatalogConfig }) {
  const brands = config.brands.filter((brand) => brand.catalog.length > 0);
  if (brands.length === 0) return null;

  const directionCount = brands.reduce((sum, brand) => sum + brand.catalog.length, 0);
  const linkCount = brands.reduce(
    (sum, brand) =>
      sum + brand.catalog.reduce((s, category) => s + (category.subcategories?.length ?? 0), 0),
    0,
  );
  const accent = brands[0]?.brandColor ?? 'var(--color-accent)';

  return (
    <section className="category-featured-catalog" style={{ '--brand-accent': accent } as React.CSSProperties}>
      <div className="category-featured-catalog-head">
        <div className="category-featured-catalog-copy">
          <div className="category-featured-catalog-kicker">
            <Icons.shield width={14} height={14} /> Официальные бренды · {brands.length}
          </div>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
          <div className="category-featured-catalog-meta">
            <span>{brands.length} брендов</span>
            <span>{directionCount} направлений</span>
            <span>{linkCount} ссылок на официальные каталоги</span>
          </div>
          <div className="category-featured-brand-chips">
            {brands.map((brand) => (
              <Link
                key={brand.brandSlug}
                href={`/brands/${brand.brandSlug}`}
                className="category-featured-brand-chip"
                style={{ '--brand-accent': brand.brandColor } as React.CSSProperties}
                title={`Открыть страницу ${brand.brandName}`}
              >
                <span className="category-featured-brand-chip-logo">
                  <Image src={brand.logoUrl} alt={brand.brandName} width={88} height={34} />
                </span>
                <span className="category-featured-brand-chip-name">{brand.brandName}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="category-featured-catalog-actions">
          <Link href="/brands" className="btn btn-secondary btn-sm category-featured-brand-btn">
            Все бренды <Icons.arrow width={12} height={12} />
          </Link>
          <a href="#category-products" className="btn btn-primary btn-sm">К товарам ↓</a>
        </div>
      </div>

      <MultiBrandCatalogExplorer brands={brands} />
    </section>
  );
}
