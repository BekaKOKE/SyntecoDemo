'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AI } from '@/lib/icons';
import { getBrands, getCategories, getWarehouses, type WarehouseDTO } from '@/lib/api/admin';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '@/components/Toast';
import { ImageUpload } from '@/components/ImageUpload';

/* ── Helpers ──────────────────────────────────────────── */
function genSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = '';
  for (let i = 0; i < 10; i++) sku += chars[Math.floor(Math.random() * chars.length)];
  return sku;
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--ink-3)',
  display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

const sectionStyle: React.CSSProperties = {
  fontSize: 15, fontWeight: 800, color: 'var(--ink)',
  marginBottom: 16, paddingBottom: 12,
  borderBottom: '1px solid var(--border)',
  letterSpacing: '-0.01em',
};

export interface ProductFormData {
  title: string;
  variantId: string;
  brandId: string;
  price: string;
  salePrice: string;
  description: string;
  mpn: string;
  imageUrl: string;
  availability: string;
  categoryIds: string[];
  attributes: { key: string; value: string }[];
  stock: { warehouseId: string; quantity: number }[];
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductFormData;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
}

/* ── Component ─────────────────────────────────────────── */
export function ProductForm({ mode, initialData, onSubmit, submitLabel }: ProductFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === 'edit' && !initialData);

  // New brand inline
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  const defaultForm: ProductFormData = {
    title: '',
    variantId: genSKU(),
    brandId: '',
    price: '',
    salePrice: '',
    description: '',
    mpn: '',
    imageUrl: '',
    availability: 'in_stock',
    categoryIds: [],
    attributes: [{ key: '', value: '' }],
    stock: [],
  };

  const [form, setForm] = useState<ProductFormData>(initialData ?? defaultForm);

  // Sync initialData when it becomes available (edit mode)
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setLoadingData(false);
    }
  }, [initialData]);

  // Load brands, categories and warehouses
  useEffect(() => {
    Promise.all([getBrands(), getCategories(), getWarehouses()]).then(([b, c, w]) => {
      setBrands(b);
      setCategories(c);
      setWarehouses(w);
      setForm(prev => ({
        ...prev,
        stock: w.map(warehouse => ({
          warehouseId: warehouse.id,
          quantity: prev.stock.find(s => s.warehouseId === warehouse.id)?.quantity ?? 0,
        })),
      }));
    }).catch(() => {});
  }, []);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleCategory(id: string) {
    set('categoryIds', form.categoryIds.includes(id)
      ? form.categoryIds.filter(c => c !== id)
      : [...form.categoryIds, id]);
  }

  function setAttr(idx: number, field: 'key' | 'value', val: string) {
    const attrs = [...form.attributes];
    attrs[idx] = { ...(attrs[idx] ?? { key: '', value: '' }), [field]: val };
    if (idx === attrs.length - 1 && attrs[idx].key && attrs[idx].value) {
      attrs.push({ key: '', value: '' });
    }
    set('attributes', attrs);
  }

  function removeAttr(idx: number) {
    if (form.attributes.length <= 1) return;
    set('attributes', form.attributes.filter((_, i) => i !== idx));
  }

  function setStock(warehouseId: string, qty: number) {
    set('stock', warehouses.map(warehouse => {
      const existing = form.stock.find(s => s.warehouseId === warehouse.id);
      return {
        warehouseId: warehouse.id,
        quantity: warehouse.id === warehouseId ? qty : existing?.quantity ?? 0,
      };
    }));
  }

  // Create brand inline
  async function handleCreateBrand() {
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    try {
      const brand = await apiFetch('/brands', {
        method: 'POST',
        body: JSON.stringify({ name: newBrandName.trim(), website: newBrandWebsite.trim() || undefined }),
      });
      setBrands(prev => [...prev, brand]);
      set('brandId', brand.id);
      setNewBrandName('');
      setNewBrandWebsite('');
      setShowNewBrand(false);
      pushToast(`Бренд «${brand.name}» создан`, 'success');
    } catch (e: any) {
      pushToast(e?.message || 'Ошибка создания бренда', 'error');
    } finally {
      setCreatingBrand(false);
    }
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.variantId.trim() || !form.brandId || !form.price) {
      pushToast('Заполните обязательные поля: название, SKU, бренд, цена', 'error');
      return;
    }

    setSaving(true);
    try {
      const attrObj: Record<string, string> = {};
      form.attributes.filter(a => a.key.trim()).forEach(a => { attrObj[a.key.trim()] = a.value.trim(); });

      const body: any = {
        title: form.title.trim(),
        variantId: form.variantId.trim(),
        brandId: form.brandId,
        price: Number(form.price),
        description: form.description.trim() || undefined,
        mpn: form.mpn.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        availability: form.availability,
        attributes: Object.keys(attrObj).length > 0 ? attrObj : undefined,
        categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
      };

      if (form.salePrice) body.salePrice = Number(form.salePrice);

      const stockData = form.stock.filter(s => s.quantity > 0);
      if (stockData.length > 0) body.stock = stockData;

      await onSubmit(body);
      pushToast(mode === 'create' ? 'Товар создан' : 'Товар обновлён', 'success');
      router.push('/products');
    } catch (e: any) {
      pushToast(e?.message || 'Ошибка сохранения товара', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return <div className="page"><div className="muted" style={{ padding: 60, textAlign: 'center' }}>Загрузка…</div></div>;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{mode === 'create' ? 'Новый товар' : 'Редактирование товара'}</div>
          <div className="page-sub">{mode === 'create' ? 'Полная форма добавления товара в каталог' : form.title}</div>
        </div>
        <div className="row-gap" style={{ gap: 8 }}>
          <button onClick={() => router.push('/products')} className="btn btn-secondary">
            {mode === 'create' ? '← К списку товаров' : '← К списку'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Section 1: Basic Info ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={sectionStyle}>Основная информация</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="product-title" style={labelStyle}>Название товара *</label>
              <input id="product-title" className="input" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="Например: Респиратор 3M 8511 N95 с клапаном выдоха"
              />
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="product-sku" style={labelStyle}>SKU / Артикул *</label>
              <div className="row-gap" style={{ gap: 8 }}>
                <input id="product-sku" className="input" value={form.variantId} onChange={e => set('variantId', e.target.value)}
                  placeholder="SAF-8511-N95" style={{ flex: 1 }} />
                {mode === 'create' && (
                  <button type="button" onClick={() => set('variantId', genSKU())}
                    className="btn btn-secondary btn-sm" style={{ height: 36, whiteSpace: 'nowrap' }}>
                    <AI.cmd /> Сгенерировать
                  </button>
                )}
              </div>
            </div>

            {/* MPN */}
            <div>
              <label htmlFor="product-mpn" style={labelStyle}>MPN (номер производителя)</label>
              <input id="product-mpn" className="input" value={form.mpn} onChange={e => set('mpn', e.target.value)}
                placeholder="DDF485Z" />
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="product-brand" style={labelStyle}>Бренд *</label>
              {!showNewBrand ? (
                <div className="row-gap" style={{ gap: 8 }}>
                  <select id="product-brand" className="input" value={form.brandId} onChange={e => set('brandId', e.target.value)} style={{ flex: 1 }}>
                    <option value="">Выберите бренд…</option>
                    {brands.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewBrand(true)}
                    className="btn btn-secondary btn-sm" style={{ height: 36, whiteSpace: 'nowrap' }}>
                    <AI.plus /> Новый
                  </button>
                </div>
              ) : (
                <div className="card" style={{ padding: 14, background: 'var(--surface-2)', border: '1px dashed var(--border-strong)' }}>
                  <div className="row-gap" style={{ gap: 8, marginBottom: 8 }}>
                    <input className="input" value={newBrandName} onChange={e => setNewBrandName(e.target.value)}
                      placeholder="Название бренда *" aria-label="Название нового бренда" style={{ flex: 1 }} />
                    <input className="input" value={newBrandWebsite} onChange={e => setNewBrandWebsite(e.target.value)}
                      aria-label="Сайт нового бренда"
                      placeholder="Сайт (необяз.)" style={{ flex: 1 }} />
                  </div>
                  <div className="row-gap" style={{ gap: 8 }}>
                    <button type="button" onClick={handleCreateBrand} disabled={creatingBrand || !newBrandName.trim()}
                      className="btn btn-primary btn-sm">
                      {creatingBrand ? 'Создание…' : <><AI.check /> Создать бренд</>}
                    </button>
                    <button type="button" onClick={() => { setShowNewBrand(false); setNewBrandName(''); }}
                      className="btn btn-ghost btn-sm">Отмена</button>
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="product-availability" style={labelStyle}>Статус наличия</label>
              <select id="product-availability" className="input" value={form.availability} onChange={e => set('availability', e.target.value)}>
                <option value="in_stock">В наличии</option>
                <option value="out_of_stock">Нет в наличии</option>
                <option value="discontinued">Снят с производства</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="product-price" style={labelStyle}>Цена (₸) *</label>
              <input id="product-price" className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="1840" min="0" step="0.01" />
            </div>

            {/* Sale Price */}
            <div>
              <label htmlFor="product-sale-price" style={labelStyle}>Цена со скидкой (₸)</label>
              <input id="product-sale-price" className="input" type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)}
                placeholder="1500" min="0" step="0.01" />
            </div>
          </div>
        </div>

        {/* ── Section 2: Image ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={sectionStyle}>Изображение</div>
          <ImageUpload imageUrl={form.imageUrl} onChange={(url) => set('imageUrl', url)} />
        </div>

        {/* ── Section 3: Categories ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={sectionStyle}>Категории</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c: any) => {
              const active = form.categoryIds.includes(c.id);
              return (
                <button key={c.id} type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`pill ${active ? 'pill-ok' : ''}`}
                  style={{ cursor: 'pointer', fontSize: 12, height: 28, padding: '0 12px' }}
                >
                  {active && <AI.check />}
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section 4: Attributes ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={sectionStyle}>Характеристики (attributes)</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
            Добавьте технические характеристики в формате «ключ = значение».
            Например: «Диаметр = 10 мм», «Материал = Нержавеющая сталь», «Напряжение = 220 В».
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {form.attributes.map((attr, i) => (
              <div key={i} className="row-gap" style={{ gap: 10 }}>
                <input className="input" value={attr.key}
                  aria-label={`Характеристика ${i + 1}`}
                  onChange={e => setAttr(i, 'key', e.target.value)}
                  placeholder="Характеристика (например: Диаметр)"
                  style={{ flex: 1 }} />
                <input className="input" value={attr.value}
                  aria-label={`Значение характеристики ${i + 1}`}
                  onChange={e => setAttr(i, 'value', e.target.value)}
                  placeholder="Значение (например: 10 мм)"
                  style={{ flex: 1 }} />
                {form.attributes.length > 1 && (
                  <button type="button" onClick={() => removeAttr(i)}
                    className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', minWidth: 28 }}>
                    <AI.trash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: Stock ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={sectionStyle}>Остатки по складам</div>
          {warehouses.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>
              Warehouses are not loaded yet. Stock can be added after warehouses are available.
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {warehouses.map((wh) => {
              const stock = form.stock.find(s => s.warehouseId === wh.id);
              const inputId = `product-stock-${wh.code.toLowerCase()}`;
              return (
                <div key={wh.id}>
                  <label htmlFor={inputId} style={labelStyle}>{wh.name} ({wh.code})</label>
                  <input id={inputId} className="input" type="number" min="0"
                    value={stock?.quantity || ''}
                    onChange={e => {
                      const v = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                      setStock(wh.id, v);
                    }} />
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* ── Section 6: Description ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <label htmlFor="product-description" style={sectionStyle}>Описание</label>
          <textarea id="product-description" className="input" value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} placeholder="Описание товара, технические детали, применение…"
            style={{ height: 'auto', padding: '14px', resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }} />
        </div>

        {/* ── Actions ── */}
        <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
          <button type="button" onClick={() => router.push('/products')} className="btn btn-secondary btn-lg">
            Отмена
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}
            style={{ minWidth: 180 }}>
            {saving ? 'Сохранение…' : submitLabel ?? (mode === 'create' ? <><AI.plus /> Создать товар</> : <><AI.check /> Сохранить изменения</>)}
          </button>
        </div>
      </form>
    </div>
  );
}
