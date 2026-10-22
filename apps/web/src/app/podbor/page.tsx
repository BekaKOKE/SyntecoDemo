import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { getOfficialBrands, getBrandConfig } from '@/config/brands';
import type { BrandConfig } from '@/config/brands/types';
import { getProductsListServer } from '@/lib/api/products-server';
import type { Product } from '@/lib/api/products';
import {
  brandMatchesIndustry,
  productMatchesCondition,
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  CONDITION_LABELS,
} from '@/lib/advisor';
import { AdvisorProductGrid } from './AdvisorProductGrid';

export const revalidate = 300;
const SITE = 'https://synteco.kz';

type SP = Promise<{ categorySlug?: string; industry?: string; condition?: string }>;

function parse(sp: Awaited<SP>) {
  const category = sp.categorySlug && sp.categorySlug !== 'any' ? sp.categorySlug : undefined;
  const industry = sp.industry ?? '';
  const condition = sp.condition ?? '';
  return {
    category,
    industry,
    condition,
    categoryLabel: category ? CATEGORY_LABELS[category] ?? category : null,
    industryLabel: industry && industry !== 'any' ? INDUSTRY_LABELS[industry] ?? industry : null,
    conditionLabel: condition && condition !== 'any' ? CONDITION_LABELS[condition] ?? condition : null,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { categoryLabel, industryLabel, conditionLabel } = parse(await searchParams);
  const parts = [categoryLabel, industryLabel, conditionLabel].filter(Boolean);
  const scope = parts.length ? ` — ${parts.join(' · ')}` : '';
  return {
    title: `Подбор товара${scope}`,
    description: `Подбор промышленного снабжения${scope}: официальные бренды и подходящие товары с доставкой по Казахстану.`,
    alternates: { canonical: `${SITE}/podbor` },
    robots: { index: false, follow: true },
  };
}

interface BrandGroup { brand: BrandConfig; products: Product[] }

export default async function PodborPage({ searchParams }: { searchParams: SP }) {
  const { category, industry, condition, categoryLabel, industryLabel, conditionLabel } = parse(await searchParams);

  // ── 1. Build the matched product pool (category + condition) ──
  // Industry is a *brand* attribute (only represented brands carry it), so it
  // gates the brands block below. Products are matched by the fields they
  // actually have in the DB: category + condition (strict). We also pull the
  // represented brands' own products so their block is well populated.
  const qualifyingBrands = getOfficialBrands().filter((b) => brandMatchesIndustry(b, industry));

  const [catalogPool, ...brandPools] = await Promise.all([
    getProductsListServer({ categorySlug: category, limit: 100 }),
    ...qualifyingBrands.map((b) => getProductsListServer({ brandSlug: b.slug, categorySlug: category, limit: 24 })),
  ]);

  // Merge & de-duplicate by product id.
  const byId = new Map<string, Product>();
  for (const p of [...catalogPool, ...brandPools.flat()]) if (p?.id) byId.set(p.id, p);

  // Strict condition filter (real data: title / RU-desc / attributes / specs).
  const matched = [...byId.values()].filter((p) => productMatchesCondition(p, condition));

  // ── 2. Group into official-brand blocks + a general products block ──
  const officialSlugs = new Set(getOfficialBrands().map((b) => b.slug));
  const brandMap = new Map<string, Product[]>();
  for (const p of matched) {
    const slug = p.brand?.slug;
    if (slug && officialSlugs.has(slug) && brandMatchesIndustry(getBrandConfig(slug)!, industry)) {
      const arr = brandMap.get(slug) ?? [];
      arr.push(p);
      brandMap.set(slug, arr);
    }
  }
  const brandGroups: BrandGroup[] = [...brandMap.entries()]
    .map(([slug, products]) => ({ brand: getBrandConfig(slug)!, products }))
    .sort((a, b) => b.products.length - a.products.length);

  const previewIds = new Set(brandGroups.flatMap((g) => g.products.slice(0, 3).map((p) => p.id)));
  const otherProducts = matched.filter((p) => !previewIds.has(p.id));

  const scopeParts = [categoryLabel, industryLabel, conditionLabel].filter(Boolean);
  const catalogQs = new URLSearchParams();
  if (category) catalogQs.set('categorySlug', category);
  const catalogHref = `/products${catalogQs.toString() ? `?${catalogQs.toString()}` : ''}`;
  const nothing = brandGroups.length === 0 && otherProducts.length === 0;

  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '70vh', paddingBottom: 80 }}>
      <div className="container-site" style={{ paddingTop: 20 }}>
        {/* ── Hero (category-page style) ── */}
        <section style={{ border: '1px solid var(--color-hair)', borderRadius: 14, background: 'var(--color-surface)', padding: '22px 24px', marginBottom: 18 }}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <Link href="/" className="muted" style={{ fontSize: 12, textDecoration: 'none' }}>Главная</Link>
            <span className="muted" style={{ fontSize: 12 }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink-2)' }}>Подбор товара</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20, alignItems: 'end' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 7 }}>
                03 · Подбор
              </div>
              <h1 style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 750, margin: 0 }}>
                {scopeParts.length ? scopeParts.join(' · ') : 'Результаты подбора'}
              </h1>
              <p style={{ margin: '9px 0 0', maxWidth: 720, color: 'var(--color-ink-3)', fontSize: 14, lineHeight: 1.55 }}>
                Сначала — бренды, с которыми мы работаем официально, затем подходящие товары каталога. Всё строго по вашим параметрам.
              </p>
              <div style={{ marginTop: 14 }}>
                <Link href="/#advisor" className="btn btn-ghost btn-sm">← Изменить запрос</Link>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <MetricPill label="Бренды" value={String(brandGroups.length)} />
              <MetricPill label="Товары" value={String(matched.length)} />
              <MetricPill label="Условие" value={conditionLabel ?? '—'} />
            </div>
          </div>
        </section>

        {nothing ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 16, color: 'var(--color-ink-2)' }}>Точных совпадений по вашим параметрам не нашлось.</p>
            <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              {conditionLabel ? `По условию «${conditionLabel}» подходящих товаров в этой категории пока нет. ` : ''}
              Попробуйте ослабить условие или открыть весь каталог.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <Link href={catalogHref} className="btn btn-primary">Открыть каталог</Link>
              <Link href="/#advisor" className="btn btn-secondary">Изменить запрос</Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Block 1: official brands ── */}
            {brandGroups.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-4)', marginBottom: 4 }}>
                  Официальные бренды под ваш запрос
                </div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Работаем напрямую — сертификаты, документация и поставка</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {brandGroups.map(({ brand, products }) => (
                    <div key={brand.slug} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={brand.logoUrl} alt={brand.name} style={{ height: 28, width: 'auto', maxWidth: 90, objectFit: 'contain' }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{brand.name}</div>
                            <div className="muted" style={{ fontSize: 11 }}>Официальный дистрибьютор · {products.length} тов.</div>
                          </div>
                        </div>
                        <span className="pill solid" style={{ fontSize: 10 }}>Official</span>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {products.slice(0, 3).map((p) => (
                          <Link key={p.id} href={`/products/${p.id}`} title={p.title} className="card-lift" style={{ flex: 1, border: '1px solid var(--color-hair)', borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-2)' }}>
                            <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
                              {p.imageUrl
                                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                : <span className="mono" style={{ fontSize: 9, color: 'var(--color-ink-5)' }}>{p.variantId}</span>}
                            </div>
                          </Link>
                        ))}
                      </div>

                      <Link href={`/brands/${brand.slug}`} className="btn btn-secondary btn-sm btn-block" style={{ justifyContent: 'center' }}>
                        Все товары {brand.name} <Icons.arrow />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Block 2: matching products (category-page grid) ── */}
            {otherProducts.length > 0 && (
              <section>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-4)', marginBottom: 4 }}>
                  Подходящие товары
                </div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
                  {matched.length} товаров по вашим параметрам
                </div>
                <AdvisorProductGrid products={otherProducts} />
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Link href={catalogHref} className="btn btn-primary">Показать все в каталоге <Icons.arrow /></Link>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 92, padding: '8px 10px', border: '1px solid var(--color-hair)', borderRadius: 8, background: 'var(--color-surface-2)' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>{label}</div>
      <div style={{ marginTop: 2, fontSize: 13, fontWeight: 800, color: 'var(--color-ink)' }}>{value}</div>
    </div>
  );
}
