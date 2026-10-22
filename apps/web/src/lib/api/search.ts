import { apiFetch } from './client';
import type { Product, ProductListResponse } from './products';

export interface SearchFilters {
  q: string;
  page?: number;
  limit?: number;
  brandId?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sortBy?: string;
}

export async function search(filters: SearchFilters): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
  return apiFetch<ProductListResponse>(`/search?${params.toString()}`);
}

export async function autocomplete(q: string): Promise<{ data: { variantId: string; title: string; brandName?: string }[] }> {
  return apiFetch(`/search/autocomplete?q=${encodeURIComponent(q)}`);
}
