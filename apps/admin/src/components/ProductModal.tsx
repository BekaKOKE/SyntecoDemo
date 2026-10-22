'use client';

import { useState, useEffect } from 'react';
import { AI } from '@/lib/icons';
import { getBrands, getCategories } from '@/lib/api/admin';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '@/components/Toast';

interface ProductModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function ProductModal({ onClose, onCreated }: ProductModalProps) {
  const { pushToast } = useToast();
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    variantId: '',
    brandId: '',
    price: '',
    description: '',
    mpn: '',
    categoryIds: [] as string[],
  });

  useEffect(() => {
    Promise.all([getBrands(), getCategories()]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.variantId.trim() || !form.brandId || !form.price) {
      pushToast('Заполните обязательные поля: название, SKU, бренд, цена', 'error');
      return;
    }

    setSaving(true);
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          variantId: form.variantId.trim(),
          brandId: form.brandId,
          price: Number(form.price),
          description: form.description.trim() || undefined,
          mpn: form.mpn.trim() || undefined,
          categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
        }),
      });
      pushToast('Товар создан', 'success');
      onCreated();
    } catch (e: any) {
      pushToast(e?.message || 'Ошибка создания товара', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть форму товара"
        style={{
        position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.3)',
        zIndex: 50, backdropFilter: 'blur(4px)', border: 0,
      }} />

      {/* Modal */}
      <div role="dialog" aria-modal="true" aria-labelledby="product-modal-title" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 51, width: 560, maxHeight: '90vh', overflow: 'auto',
        background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-3)', padding: 32,
      }}>
        <div className="row between" style={{ marginBottom: 24 }}>
          <div>
            <div id="product-modal-title" className="page-title" style={{ fontSize: 20 }}>Новый товар</div>
            <div className="page-sub" style={{ fontSize: 12 }}>Заполните данные для добавления в каталог</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 32, height: 32, padding: 0 }}>
            <AI.close />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="quick-product-title" style={labelStyle}>Название *</label>
            <input id="quick-product-title" className="input" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Например: Респиратор 3M 8511 N95" />
          </div>

          {/* SKU + Price row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label htmlFor="quick-product-sku" style={labelStyle}>SKU (variantId) *</label>
              <input id="quick-product-sku" className="input" value={form.variantId} onChange={e => set('variantId', e.target.value)}
                placeholder="SAF-8511-N95" />
            </div>
            <div>
              <label htmlFor="quick-product-price" style={labelStyle}>Цена (₸) *</label>
              <input id="quick-product-price" className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="1840" min="0" step="0.01" />
            </div>
          </div>

          {/* Brand */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="quick-product-brand" style={labelStyle}>Бренд *</label>
            <select id="quick-product-brand" className="input" value={form.brandId} onChange={e => set('brandId', e.target.value)}>
              <option value="">Выберите бренд…</option>
              {brands.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* MPN */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="quick-product-mpn" style={labelStyle}>MPN (номер производителя)</label>
            <input id="quick-product-mpn" className="input" value={form.mpn} onChange={e => set('mpn', e.target.value)}
              placeholder="DDF485Z" />
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Категории</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map((c: any) => {
                const active = form.categoryIds.includes(c.id);
                return (
                  <button key={c.id} type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`pill ${active ? 'pill-ok' : ''}`}
                    style={{ cursor: 'pointer', fontSize: 12, height: 26 }}
                  >
                    {active && <AI.check />}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="quick-product-description" style={labelStyle}>Описание</label>
            <textarea id="quick-product-description" className="input" value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Описание товара…"
              style={{ height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          {/* Actions */}
          <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Отмена</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Создание…' : <><AI.plus /> Создать товар</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--ink-3)',
  display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
