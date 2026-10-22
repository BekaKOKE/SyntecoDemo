'use client';

import { ProductForm } from '@/components/ProductForm';
import { apiFetch } from '@/lib/api/client';

export default function NewProductPage() {
  async function handleCreate(data: Record<string, any>) {
    await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  return <ProductForm mode="create" onSubmit={handleCreate} />;
}
