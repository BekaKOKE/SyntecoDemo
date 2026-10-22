import { apiFetch } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number;
  parentId: string | null;
  parent?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  children?: Category[];
  productCount: number;
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

export async function getCategoryTree(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories/tree');
}

export async function getCategory(slug: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${slug}`);
}
