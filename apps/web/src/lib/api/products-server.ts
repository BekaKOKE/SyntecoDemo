import type { Product } from './products';

/**
 * Server-side product fetch for Server Components (SSR/ISR).
 *
 * Unlike the browser `apiFetch` (which talks to the Next rewrite `/api/v1`),
 * this hits the API directly via API_URL so it works during server rendering.
 * Returns null on 404 / error so callers can render notFound().
 */
const API_BASE = (process.env.API_URL ?? 'http://localhost:3000') + '/api/v1';

export async function getProductServer(
  id: string,
  revalidate = 300,
): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

/** Server-side product LIST fetch (for the advisor results page, etc.). */
export async function getProductsListServer(
  params: { categorySlug?: string; brandSlug?: string; limit?: number; sortBy?: string } = {},
  revalidate = 300,
): Promise<Product[]> {
  try {
    const qs = new URLSearchParams();
    if (params.categorySlug) qs.set('categorySlug', params.categorySlug);
    if (params.brandSlug) qs.set('brandSlug', params.brandSlug);
    qs.set('limit', String(params.limit ?? 12));
    qs.set('sortBy', params.sortBy ?? 'relevance');
    const res = await fetch(`${API_BASE}/products?${qs.toString()}`, { next: { revalidate } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data ?? []) as Product[];
  } catch {
    return [];
  }
}
