import type { Category } from './categories';

/**
 * Server-side category fetch for Server Components (SSR/ISR metadata).
 * Hits the API directly via API_URL; returns null on 404/error.
 */
const API_BASE = (process.env.API_URL ?? 'http://localhost:3000') + '/api/v1';

export async function getCategoryServer(
  slug: string,
  revalidate = 600,
): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as Category;
  } catch {
    return null;
  }
}
