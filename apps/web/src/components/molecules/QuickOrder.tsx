'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { getProductBySku } from '@/lib/api/products';

export function QuickOrder() {
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const { addItem } = useCart();

  const submit = async () => {
    if (!sku.trim()) return;
    setStatus('loading');
    try {
      const product = await getProductBySku(sku.trim());
      addItem(product.id, 1);
      setStatus('found');
      setSku('');
      setTimeout(() => { setStatus('idle'); setOpen(false); }, 1500);
    } catch {
      setStatus('not-found');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="btn btn-ghost btn-sm" style={{ gap: 4, fontSize: 12 }}>
        ⚡ SKU
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 320, background: 'var(--color-surface)', borderRadius: 12, boxShadow: 'var(--shadow-3)', border: '1px solid var(--color-hair)', padding: 16, zIndex: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Быстрый заказ по артикулу</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={sku}
              onChange={e => { setSku(e.target.value); setStatus('idle'); }}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              placeholder="SKU или MPN..."
              style={{ flex: 1, height: 36, padding: '0 12px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)' }}
              autoFocus
            />
            <button onClick={submit} disabled={status === 'loading'} className="btn btn-primary btn-sm" style={{ height: 36 }}>
              {status === 'loading' ? '...' : 'Найти'}
            </button>
          </div>
          {status === 'found' && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-ok)' }}>✓ Товар добавлен в корзину</div>}
          {status === 'not-found' && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-warn)' }}>Товар с таким артикулом не найден</div>}
        </div>
      )}
    </div>
  );
}
