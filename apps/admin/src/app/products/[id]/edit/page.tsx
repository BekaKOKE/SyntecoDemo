'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductForm, type ProductFormData } from '@/components/ProductForm';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '@/components/Toast';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const [initialData, setInitialData] = useState<ProductFormData | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      apiFetch<any>(`/products/${id}`),
    ]).then(([product]) => {
      const attrs = Object.entries(product.attributes || {})
        .map(([key, value]) => ({ key, value: String(value) }));
      if (attrs.length === 0) attrs.push({ key: '', value: '' });
      attrs.push({ key: '', value: '' });

      const stockData = (product.stock ?? [])
        .filter((s: any) => s.warehouseId)
        .map((s: any) => ({ warehouseId: s.warehouseId, quantity: s.quantity ?? 0 }));

      setInitialData({
        title: product.title || '',
        variantId: product.variantId || '',
        brandId: product.brandId || '',
        price: String(product.price || ''),
        salePrice: product.salePrice ? String(product.salePrice) : '',
        description: product.description || '',
        mpn: product.mpn || '',
        imageUrl: product.imageUrl || '',
        availability: product.availability || 'in_stock',
        categoryIds: product.categories?.map((pc: any) => pc.categoryId) || [],
        attributes: attrs,
        stock: stockData,
      });
    }).catch(() => {
      pushToast('Ошибка загрузки товара', 'error');
      router.push('/products');
    });
  }, [id]);

  async function handleUpdate(data: Record<string, any>) {
    await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  if (!initialData) {
    return <div className="page"><div className="muted" style={{ padding: 60, textAlign: 'center' }}>Загрузка…</div></div>;
  }

  return <ProductForm mode="edit" initialData={initialData} onSubmit={handleUpdate} />;
}
