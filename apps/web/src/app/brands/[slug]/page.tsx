import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBrandConfig, getOfficialBrands } from '@/config/brands';
import { BrandBanner } from '@/components/brands/BrandBanner';
import { BrandCatalog } from '@/components/brands/BrandCatalog';
import { BrandJsonLd } from '@/components/brands/BrandJsonLd';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render every official brand page at build time.
export async function generateStaticParams() {
  return getOfficialBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandConfig(slug);
  if (!brand) {
    return { title: 'Бренд не найден | Synteco' };
  }
  const title = `${brand.name} — официальный дистрибьютор в Казахстане | Synteco`;
  const description = `${brand.taglineRu}. Сертификаты: ${brand.certifications.join(', ')}. Производство: ${brand.country}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description: brand.taglineRu,
      images: [{ url: brand.logoUrl }],
    },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = getBrandConfig(slug);
  if (!brand) {
    notFound();
  }

  return (
    <>
      <BrandJsonLd brand={brand} />
      <BrandBanner brand={brand} />
      <Suspense
        fallback={
          <section style={{ background: 'var(--color-bg)', padding: '24px 0 80px' }}>
            <div className="container-site">
              <div className="card" style={{ height: 400, background: 'var(--color-surface)' }} />
            </div>
          </section>
        }
      >
        <BrandCatalog brandSlug={brand.slug} brandName={brand.name} brand={brand} />
      </Suspense>
    </>
  );
}
