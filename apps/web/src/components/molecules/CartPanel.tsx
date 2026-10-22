'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/cart-context';

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CartPanel({ open, onClose }: CartPanelProps) {
  const { cart, updateItem, removeItem } = useCart();
  const itemCount = cart.itemCount;
  const cartTotal = cart.totalAmount;

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9998 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, maxWidth: '100vw', background: 'var(--color-surface)', zIndex: 9999, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-hair)' }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Корзина ({itemCount})</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-4)', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p className="muted">Корзина пуста</p>
              <Link href="/products" onClick={onClose} className="btn btn-primary" style={{ marginTop: 12 }}>Перейти в каталог</Link>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.productId} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-hair)' }}>
                <div style={{ width: 64, height: 64, background: '#fafafa', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 24, color: 'var(--color-ink-4)' }}>📦</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.productId}`} onClick={onClose} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Link>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>{item.unitPrice?.toLocaleString('ru-RU')} ₸</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <button onClick={() => updateItem(item.productId, item.quantity - 1)} className="btn btn-ghost btn-sm" style={{ padding: '0 6px', minWidth: 28 }}>−</button>
                    <span style={{ fontSize: 13 }}>{item.quantity}</span>
                    <button onClick={() => updateItem(item.productId, item.quantity + 1)} className="btn btn-ghost btn-sm" style={{ padding: '0 6px', minWidth: 28 }}>+</button>
                    <button onClick={() => removeItem(item.productId)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--color-ink-4)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-hair)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: 'var(--color-ink-2)' }}>Итого:</span>
              <span className="num" style={{ fontSize: 18, fontWeight: 700 }}>{cartTotal.toLocaleString('ru-RU')} ₸</span>
            </div>
            <Link href="/cart" onClick={onClose} className="btn btn-primary btn-block" style={{ height: 44 }}>Оформить заявку</Link>
            <button onClick={onClose} className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>Продолжить покупки</button>
          </div>
        )}
      </div>
    </>
  );
}
