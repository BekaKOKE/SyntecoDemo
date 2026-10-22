import { apiFetch } from './client';

export interface Product {
  id: string;
  variantId: string;
  title: string;
  description: string | null;
  descriptionRu: string | null;
  brand: { id: string; name: string; slug: string };
  categories: { productId: string; categoryId: string; category: { id: string; name: string; slug: string; path: string } }[];
  imageUrl: string | null;
  price: number;
  salePrice: number | null;
  availability: string;
  mpn: string | null;
  attributes: Record<string, string>;
  specifications: Record<string, string>;
  prices: { tier: string; price: number; minQuantity: number }[];
  stock: { warehouseId: string; warehouse: { id: string; name: string; code: string }; quantity: number; reserved: number }[];
  images: { id: string; url: string; thumbUrl: string }[];
  documents: { id: string; name: string; url: string; type: string }[];
  createdAt: string;
}

export interface ProductListResponse {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  brandSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  warehouseId?: string;
  inStockOnly?: boolean;
  /** JSON string of attribute filters, e.g. '{"Класс защиты":"FFP3"}' */
  attributes?: string;
  sortBy?: string;
  sortDir?: string;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)); });
  const qs = params.toString();
  return apiFetch<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function getProductBySku(sku: string): Promise<Product> {
  return apiFetch<Product>(`/products/sku/${sku}`);
}

// ── Facets (filter sidebar) ─────────────────────────────

export interface FacetValue {
  value: string;
  count: number;
}

export interface AttributeFacet {
  name: string;
  displayName?: string;
  priority?: boolean;
  values: FacetValue[];
}

export interface FacetsResponse {
  priceRange: { min: number; max: number };
  brands: Array<{ id: string; name: string; count: number }>;
  attributes: AttributeFacet[];
  warehouses: Array<{ id: string; name: string; count: number }>;
}

/** Fetch filter facets for a brand catalog (or any scope). */
export async function getFacets(params: {
  brandSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  search?: string;
}): Promise<FacetsResponse> {
  const qs = new URLSearchParams();
  if (params.brandSlug) qs.set('brandSlug', params.brandSlug);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.categorySlug) qs.set('categorySlug', params.categorySlug);
  if (params.search) qs.set('search', params.search);
  return apiFetch<FacetsResponse>(`/products/facets${qs.toString() ? `?${qs}` : ''}`);
}

/** Convenience: fetch products for a brand by slug. */
export async function getProductsByBrand(
  brandSlug: string,
  filters: Omit<ProductFilters, 'brandSlug'> = {},
): Promise<ProductListResponse> {
  return getProducts({ ...filters, brandSlug });
}
