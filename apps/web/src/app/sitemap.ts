import type { MetadataRoute } from 'next';
import { getOfficialBrands } from '@/config/brands';

/**
 * Dynamic sitemap.xml — includes every catalog product, category and brand
 * pulled from the API, plus key static routes.
 *
 * Resilient by design: if the API is unreachable at generation time we still
 * emit the static routes + official brands, so the sitemap never 500s.
 *
 * Revalidated hourly so new products appear without a redeploy.
 */

const SITE = 'https://synteco.kz';
const API_BASE = (process.env.API_URL ?? 'http://localhost:3000') + '/api/v1';

export const revalidate = 3600; // 1 hour

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface Paginated<T> { data: T[]; meta?: { totalPages?: number; total?: number } }

async function getAllProducts(): Promise<Array<{ id: string; updatedAt?: string }>> {
  const first = await apiGet<Paginated<{ id: string; updatedAt?: string }>>(
    '/products?limit=100&page=1',
  );
  if (!first?.data) return [];
  const totalPages = Math.min(first.meta?.totalPages ?? 1, 500); // safety cap
  const all = [...first.data];
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
      apiGet<Paginated<{ id: string; updatedAt?: string }>>(`/products?limit=100&page=${i + 2}`),
    ),
  );
  for (const page of rest) if (page?.data) all.push(...page.data);
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Fetch catalog data in parallel; each resolver degrades to [] on failure.
  const [categories, brands, products] = await Promise.all([
    apiGet<{ data?: Array<{ slug: string }> } | Array<{ slug: string }>>('/categories'),
    apiGet<{ data?: Array<{ slug: string; _count?: { products: number } }> } | Array<{ slug: string; _count?: { products: number } }>>('/brands'),
    getAllProducts(),
  ]);

  const catList = Array.isArray(categories) ? categories : categories?.data ?? [];
  const categoryRoutes: MetadataRoute.Sitemap = catList
    .filter((c) => c?.slug)
    .map((c) => ({
      url: `${SITE}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const brandList = Array.isArray(brands) ? brands : brands?.data ?? [];
  const apiBrandRoutes: MetadataRoute.Sitemap = brandList
    .filter((b) => b?.slug && (b._count?.products ?? 1) > 0)
    .map((b) => ({
      url: `${SITE}/brands/${b.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  // Guarantee the official/curated brand pages are always present.
  const officialBrandRoutes: MetadataRoute.Sitemap = getOfficialBrands().map((b) => ({
    url: `${SITE}/brands/${b.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p?.id)
    .map((p) => ({
      url: `${SITE}/products/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  // De-duplicate brand URLs (official + api overlap).
  const seen = new Set<string>();
  const dedupe = (routes: MetadataRoute.Sitemap) =>
    routes.filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)));

  return dedupe([
    ...staticRoutes,
    ...categoryRoutes,
    ...officialBrandRoutes,
    ...apiBrandRoutes,
    ...productRoutes,
  ]);
}
