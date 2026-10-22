'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { search } from '@/lib/api/search';
import { searchBrandCatalogs } from '@/lib/catalog-search';
import { CatalogSearchResults } from '@/components/catalog/CatalogSearchResults';
import { ProductCard } from '@/components/molecules/ProductCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import type { Product } from '@/lib/api/products';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Разделы официальных каталогов брендов (PIP, uvex, 3M, …), подходящие
  // под запрос — считаются локально из конфигов, без запроса к API.
  const catalogMatches = useMemo(() => searchBrandCatalogs(q), [q]);

  useEffect(() => {
    let cancelled = false;
    if (!q) {
      setLoading(false);
      setError(null);
      setProducts([]);
      setMeta({ total: 0, totalPages: 0 });
      return () => { cancelled = true; };
    }
    setLoading(true);
    setError(null);
    setProducts([]);
    setMeta({ total: 0, totalPages: 0 });
    search({ q, page, limit: 24 }).then(r => {
      if (cancelled) return;
      setProducts(r.data);
      setMeta(r.meta);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setError('Не удалось выполнить поиск. Попробуйте ещё раз.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [q, page]);

  if (!q) {
    return (
      <div className="container-site" style={{ padding: '64px 24px', maxWidth: 720 }}>
        <h2 style={{ fontSize: 28 }}>Поиск по каталогу</h2>
        <p className="muted" style={{ marginTop: 8, marginBottom: 20 }}>
          Найдите промышленные товары, бренды и категории.
        </p>
        <SearchBar />
      </div>
    );
  }

  return (
    <div className="container-site" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Поиск: &ldquo;{q}&rdquo;</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {loading ? '…' : error ? 'Ошибка поиска' : `${meta.total.toLocaleString('ru-RU')} результатов`}
          {catalogMatches.length > 0 ? ` · ${catalogMatches.length} направлений в каталогах брендов` : ''}
        </p>
      </div>

      {page === 1 ? <CatalogSearchResults matches={catalogMatches} /> : null}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p className="muted">Загрузка…</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }} role="alert">
          <p style={{ fontSize: 18, color: 'var(--color-danger, #b42318)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>Повторить</button>
        </div>
      ) : products.length === 0 ? (
        catalogMatches.length > 0 ? (
          <div style={{ padding: '8px 0 32px' }}>
            <p className="muted">
              Товаров на складе по этому запросу нет — но выше есть разделы официальных каталогов.
              Запросите КП, и мы подберём и привезём под заказ.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: 18, color: 'var(--color-ink-3)' }}>Ничего не найдено</p>
            <p className="muted" style={{ marginTop: 8 }}>Попробуйте изменить запрос или воспользуйтесь каталогом.</p>
            <a href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Перейти в каталог</a>
          </div>
        )
      ) : (
        <div className="grid-4" style={{ gap: 20 }}>
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              variantId={p.variantId}
              brandName={p.brand?.name ?? ''}
              price={Number(p.price)}
              salePrice={p.salePrice ? Number(p.salePrice) : null}
              imageUrl={p.imageUrl ?? p.imageUrl}
              availability={p.availability}
              stockTotal={p.stock?.reduce((s, w) => s + w.quantity - w.reserved, 0) ?? 0}
              mpn={p.mpn}
              description={p.description}
              descriptionRu={p.descriptionRu}
              attributes={p.attributes}
              specifications={p.specifications}
              documents={p.documents}
              createdAt={p.createdAt}
            />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
            const pg = i + 1;
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(pg));
            return <a key={pg} href={`/search?${params.toString()}`} className={pg === page ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>{pg}</a>;
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-site" style={{ padding: '64px 24px', textAlign: 'center' }}><p className="muted">Загрузка…</p></div>}>
      <SearchResults />
    </Suspense>
  );
}
