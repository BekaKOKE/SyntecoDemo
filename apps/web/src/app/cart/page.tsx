'use client';

import Link from 'next/link';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { Icons } from '@/lib/icons';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { cart, updateItem, removeItem, clear } = useCart();
  const { isAuthenticated } = useAuth();

  if (cart.items.length === 0) {
    return (
      <div className="container-site" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: 'var(--color-ink-4)' }}><Icons.cart width={48} height={48} /></div>
        <h2>Корзина пуста</h2>
        <p className="muted" style={{ marginTop: 8 }}>Добавьте товары из каталога.</p>
        <Link href="/products" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="container-site" style={{ padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Корзина ({cart.itemCount} товаров)</h1>
        <button onClick={clear} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-warn)' }}>
          <Icons.trash /> Очистить
        </button>
      </div>

      <div className="layout-cart" style={{ alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-hair)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-2)', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div className="mono muted" style={{ fontSize: 10 }}>{item.variantId}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{item.title}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{item.brandName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-hair)', borderRadius: 'var(--radius-sm)' }}>
                    <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)} className="btn btn-ghost btn-sm" style={{ border: 'none' }}>−</button>
                    <span className="num" style={{ padding: '0 10px', fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="btn btn-ghost btn-sm" style={{ border: 'none' }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-ink-4)' }}><Icons.trash /></button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{formatPrice(item.totalPrice)}</div>
                <div className="num muted" style={{ fontSize: 12, marginTop: 2 }}>{formatPrice(item.unitPrice)} / шт</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hair)', borderRadius: 'var(--radius-md)', padding: 24, position: 'sticky', top: 100 }}>
          <h3 style={{ marginBottom: 16 }}>Ваш заказ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Позиций</span><span className="num">{cart.items.length}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Товаров</span><span className="num">{cart.itemCount}</span></div>
            <div className="hairt" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 15 }}>
              <span>Сумма</span><span className="num">{formatPrice(cart.totalAmount)}</span>
            </div>
            <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
              Без НДС. Промокоды, доп. услуги и НДС 12% рассчитываются при оформлении.
            </p>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Оформить заказ
            </Link>
            <Link href="/contacts" className="btn btn-ghost" style={{ width: '100%', fontSize: 14 }}>
              Запросить КП у менеджера
            </Link>
            {!isAuthenticated && (
              <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
                Для оформления заказа нужно войти в аккаунт
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
