'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AI } from '@/lib/icons';
import { getProducts, getBrands, getCategories, deleteProduct } from '@/lib/api/admin';
import { fmtTng } from '@/lib/formatters';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function ProductsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; sku: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [brandFilter, setBrandFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const limit = 25;

  const load = useCallback(async (p: number, search: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page: p, limit, sortBy: 'createdAt', sortDir: 'desc' };
      if (search) params.search = search;
      if (filter === 'active') params.availability = 'in_stock';
      if (filter === 'hidden') params.availability = 'out_of_stock';
      if (brandFilter) params.brandId = brandFilter;
      if (catFilter) params.categoryId = catFilter;

      const res = await getProducts(params);
      setProducts(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (e) {
      console.error('Products load error:', e);
    } finally {
      setLoading(false);
    }
  }, [filter, brandFilter, catFilter]);

  useEffect(() => {
    load(page, q);
  }, [page, filter, brandFilter, catFilter]);

  useEffect(() => {
    Promise.all([getBrands(), getCategories()]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
    }).catch(() => {});
  }, []);

  // Live debounced search
  function onSearchInput(val: string) {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(1, val);
    }, 300);
  }

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((r) => r.id)));
  };

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      pushToast(`Товар ${deleteTarget.sku} удалён`, 'success');
      setDeleteTarget(null);
      load(page, q);
    } catch {
      pushToast('Ошибка удаления', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const filterTabs = [
    { id: "all", name: "Все", n: total },
    { id: "active", name: "В наличии", n: '' },
    { id: "hidden", name: "Нет в наличии", n: '' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Товары</div>
          <div className="page-sub">{total.toLocaleString('ru-RU')} карточек в каталоге</div>
        </div>
        <div className="row-gap" style={{ gap: 8 }}>
          <button onClick={() => router.push('/products/new')} className="btn btn-primary"><AI.plus /> Добавить товар</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="row-gap" style={{
          height: 36, padding: "0 12px", borderRadius: 8,
          border: "1px solid var(--border)", background: "#fff",
          gap: 10, minWidth: 280,
        }}>
          <AI.search style={{ color: "var(--ink-3)" }} />
          <input value={q} onChange={(e) => onSearchInput(e.target.value)}
            placeholder="Поиск по названию, SKU или MPN…" style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--ink)" }} />
        </div>

        <div className="seg">
          {filterTabs.map((t) => (
            <button key={t.id} onClick={() => { setFilter(t.id); setPage(1); }} className={filter === t.id ? "active" : ""}>
              {t.name} {t.n !== '' && <span className="mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>{t.n}</span>}
            </button>
          ))}
        </div>

        <select onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }} value={brandFilter}
          style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', fontSize: 12, fontWeight: 600, color: 'var(--ink)', background: '#fff' }}>
          <option value="">Все бренды</option>
          {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} value={catFilter}
          style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px', fontSize: 12, fontWeight: 600, color: 'var(--ink)', background: '#fff' }}>
          <option value="">Все категории</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        {selected.size > 0 && (
          <div className="row-gap fade-up" style={{ gap: 8 }}>
            <span className="pill pill-ink">{selected.size} выбрано</span>
            <button onClick={() => { pushToast(`Удалено ${selected.size} товаров`, "error"); setSelected(new Set()); }} className="btn btn-danger btn-sm">
              <AI.trash /> Удалить
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36, paddingRight: 0 }}>
                <input type="checkbox" onChange={toggleAll} checked={products.length > 0 && selected.size === products.length}
                  style={{ width: 14, height: 14, accentColor: "var(--red)" }} />
              </th>
              <th>Товар</th>
              <th>SKU</th>
              <th>Бренд</th>
              <th style={{ textAlign: "right" }}>Цена</th>
              <th style={{ textAlign: "right" }}>Остаток</th>
              <th>Статус</th>
              <th style={{ textAlign: "right" }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>Загрузка…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
                {q ? `Ничего не найдено по запросу «${q}»` : 'Товаров нет'}
              </td></tr>
            ) : products.map((p: any, i: number) => {
              const isSel = selected.has(p.id);
              const price = Number(p.price ?? 0);
              const stockTotal = p.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
              const inStock = p.availability === 'in_stock';
              const categoryNames = p.categories?.map((pc: any) => pc.category?.name).join(', ') || '—';
              const brandName = p.brand?.name || '—';
              const tone = stockTotal < 10 ? 'red' : stockTotal < 50 ? 'amber' : 'graphite';
              return (
                <tr key={p.id} className="fade-up" style={{ background: isSel ? "var(--red-light)" : "", animationDelay: `${i * 20}ms` }}>
                  <td style={{ paddingRight: 0 }}>
                    <input type="checkbox" checked={isSel} onChange={() => toggle(p.id)} style={{ width: 14, height: 14, accentColor: "var(--red)" }} />
                  </td>
                  <td>
                    <div className="row-gap" style={{ gap: 12 }}>
                      <div className={`thumb tone-${tone}`} style={{ width: 42, height: 42 }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <span className="mono" style={{ fontSize: 8, color: "var(--ink-4)" }}>{p.variantId?.slice(0, 4) || 'SKU'}</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em", maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, fontWeight: 600 }}>{brandName} · {categoryNames}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.variantId}</td>
                  <td style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>{brandName}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--ink)" }} className="num">{fmtTng(price)} ₸</td>
                  <td style={{ textAlign: "right" }} className="num">
                    <span style={{ fontSize: 13, fontWeight: 700, color: stockTotal < 10 ? "var(--red)" : "var(--ink)" }}>{fmtTng(stockTotal)}</span>
                  </td>
                  <td>
                    <span className={`pill ${inStock ? "pill-ok" : ""}`}>
                      <span className="dot" />{inStock ? "В наличии" : "Нет"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row-gap" style={{ gap: 2, justifyContent: "flex-end" }}>
                      <button onClick={() => router.push(`/products/${p.id}/edit`)} className="btn btn-ghost btn-sm" style={{ color: "var(--info)" }} title="Редактировать"><AI.edit /></button>
                      <button onClick={() => setDeleteTarget({ id: p.id, sku: p.variantId, name: p.title })} className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} title="Удалить"><AI.trash /></button>
                      <button className="btn btn-ghost btn-sm" title="Ещё"><AI.more /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="row between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
          <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
            Показано <span className="num" style={{ color: "var(--ink)" }}>{(page - 1) * limit + 1}—{Math.min(page * limit, total)}</span> из <span className="num" style={{ color: "var(--ink)" }}>{total}</span>
          </span>
          <div className="row-gap" style={{ gap: 4 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Назад</button>
            {(function() {
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (page > 3) pages.push('…');
                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);
                for (let i = start; i <= end; i++) pages.push(i);
                if (page < totalPages - 2) pages.push('…');
                pages.push(totalPages);
              }
              return pages.map((pn, idx) =>
                typeof pn === 'string'
                  ? <span key={`gap-${idx}`} style={{ color: 'var(--ink-4)', padding: '0 2px' }}>…</span>
                  : <button key={pn} onClick={() => setPage(pn as number)}
                      className={pn === page ? "btn btn-dark btn-sm" : "btn btn-secondary btn-sm"}
                      style={{ minWidth: 32, padding: 0, height: 30 }}>{pn}</button>
              );
            })()}
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Дальше →</button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Удалить товар?"
          message={`Вы уверены, что хотите удалить «${deleteTarget.name}» (${deleteTarget.sku})? Это действие нельзя отменить.`}
          confirmLabel="Удалить"
          danger
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
