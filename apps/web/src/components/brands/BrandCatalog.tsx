'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Icons } from '@/lib/icons';
import type { BrandConfig } from '@/config/brands/types';
import { BrandCatalogExplorer } from './BrandCatalogExplorer';

interface BrandCatalogProps {
  brandSlug: string;
  brandName: string;
  brand: BrandConfig;
}

export function BrandCatalog({ brandSlug, brandName, brand }: BrandCatalogProps) {
  // void brandSlug — kept in signature for backwards compat with callers.
  void brandSlug;

  return (
    <section style={{ background: 'var(--color-bg)', padding: '24px 0 56px' }}>
      <div className="container-site">
        {/* Breadcrumb */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            fontSize: 12,
            color: 'var(--color-ink-3)',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ color: 'var(--color-ink-3)' }}>
            Главная
          </Link>
          <span style={{ color: 'var(--color-ink-5)' }}>/</span>
          <Link href="/brands" style={{ color: 'var(--color-ink-3)' }}>
            Бренды
          </Link>
          <span style={{ color: 'var(--color-ink-5)' }}>/</span>
          <span style={{ color: 'var(--color-ink)' }}>{brandName}</span>
        </div>

        <BrandB2BOverview brand={brand} />
        <BrandStory brand={brand} />

        {/* Full product catalog (links out to official site). */}
        {brand.productCatalog && brand.productCatalog.length > 0 ? (
          <BrandCatalogExplorer
            brandName={brand.name}
            brandColor={brand.heroColor}
            website={brand.website}
            catalog={brand.productCatalog}
          />
        ) : null}
      </div>
    </section>
  );
}

function BrandB2BOverview({ brand }: { brand: BrandConfig }) {
  const topCategories = brand.categories.slice(0, 5);
  const topIndustries = brand.industries.slice(0, 5);
  const topCertifications = brand.certifications.slice(0, 6);

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.25fr) minmax(260px, 0.75fr)',
        gap: 16,
        marginBottom: 20,
      }}
      className="brand-overview-grid"
    >
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 8 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            borderBottom: '1px solid var(--color-hair)',
            background: 'var(--color-surface)',
          }}
          className="brand-proof-grid"
        >
          {[
            ['Официальный канал', 'Поставка с документами'],
            ['Подбор аналогов', 'Помощь по спецификации'],
            ['B2B-закупки', 'КП и сроки под заказ'],
          ].map(([title, text]) => (
            <div key={title} style={{ padding: 16, borderRight: title === 'B2B-закупки' ? 0 : '1px solid var(--color-hair)' }}>
              <div style={{ color: 'var(--color-accent)', marginBottom: 8 }}>
                <Icons.check width={16} height={16} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-ink)' }}>{title}</div>
              <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45, color: 'var(--color-ink-3)' }}>{text}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>
                Направления бренда
              </div>
              <h2 style={{ marginTop: 4, fontSize: 22, lineHeight: 1.2, fontWeight: 760, letterSpacing: 0 }}>
                {brand.name}: ключевые направления
              </h2>
            </div>
            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ flexShrink: 0, textDecoration: 'none' }}>
              Сайт бренда <Icons.external width={12} height={12} />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            {topCategories.map((category) => {
              const cardStyle: CSSProperties = { position: 'relative', minHeight: 86, padding: 14, border: '1px solid var(--color-hair)', borderRadius: 8, background: 'var(--color-surface-2)' };
              const inner = (
                <>
                  <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'var(--color-surface)', color: 'var(--color-accent)', border: '1px solid var(--color-hair)' }}>
                    {category.iconName === 'lock' ? <Icons.lock width={15} height={15} /> : category.iconName === 'package' ? <Icons.package width={15} height={15} /> : category.iconName === 'wrench' ? <Icons.wrench width={15} height={15} /> : category.iconName === 'warning' ? <Icons.warning width={15} height={15} /> : <Icons.shield width={15} height={15} />}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 750, color: 'var(--color-ink)', lineHeight: 1.3 }}>
                    {category.name}
                  </div>
                </>
              );

              if (category.url) {
                return (
                  <a
                    key={category.name}
                    href={category.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-category-card-link"
                    style={{ ...cardStyle, display: 'block', textDecoration: 'none', color: 'inherit' }}
                    title={`${category.name} — на официальном сайте ${brand.name}`}
                  >
                    <span style={{ position: 'absolute', top: 10, right: 10, color: 'var(--color-ink-4)', display: 'inline-flex' }} aria-hidden>
                      <Icons.external width={11} height={11} />
                    </span>
                    {inner}
                  </a>
                );
              }

              return (
                <div key={category.name} style={cardStyle}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="card" style={{ padding: 18, borderRadius: 8, background: 'var(--color-surface)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>
          Профиль поставки
        </div>
        <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
          <BrandTagGroup title="Отрасли" items={topIndustries} />
          <BrandTagGroup title="Стандарты и допуски" items={topCertifications} />
        </div>
        <div className="hairt" style={{ marginTop: 16, paddingTop: 16, display: 'grid', gap: 10 }}>
          <Link href="/contacts" className="btn btn-primary btn-block" style={{ textDecoration: 'none' }}>
            Запросить КП
          </Link>
        </div>
      </aside>
    </section>
  );
}

function BrandStory({ brand }: { brand: BrandConfig }) {
  if (!brand.descriptionRu && !brand.featureBlocks?.length) return null;

  return (
    <section className="brand-story card">
      <div className="brand-story-grid">
        <div>
          <div className="eyebrow">О производителе</div>
          <h2>{brand.name}: экспертиза и решения</h2>
          {brand.descriptionRu && <p>{brand.descriptionRu}</p>}
        </div>

        {brand.featureBlocks?.length ? (
          <div className="brand-feature-grid">
            {brand.featureBlocks.map((feature, index) => (
              <article key={feature.title} className="brand-feature-card">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BrandTagGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 800, color: 'var(--color-ink)' }}>{title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map((item) => (
          <span key={item} style={{ padding: '6px 8px', border: '1px solid var(--color-hair)', borderRadius: 6, background: 'var(--color-surface-2)', color: 'var(--color-ink-2)', fontSize: 12, fontWeight: 650 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
