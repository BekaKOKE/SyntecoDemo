'use client';

import { useEffect, useState } from 'react';

interface FlyItem {
  id: number;
  imageUrl: string;
  startX: number;
  startY: number;
}

/**
 * Listens for 'cart-fly' custom DOM events and renders flying product images
 * that animate from the clicked button toward the cart icon.
 *
 * Keyframes are in globals.css (`@keyframes cart-fly`) so they're available
 * before any fly item mounts.
 */
export function CartFly() {
  const [items, setItems] = useState<FlyItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        imageUrl: string;
        x: number;
        y: number;
      };
      if (!detail?.imageUrl) return;
      const id = Date.now() + Math.random();
      setItems(prev => [...prev, { id, imageUrl: detail.imageUrl, startX: detail.x, startY: detail.y }]);
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== id));
      }, 700);
    };
    window.addEventListener('cart-fly', handler);
    return () => window.removeEventListener('cart-fly', handler);
  }, []);

  return (
    <>
      {items.map(item => (
        <img
          key={item.id}
          src={item.imageUrl}
          alt=""
          style={{
            position: 'fixed',
            zIndex: 9999,
            width: 56,
            height: 56,
            objectFit: 'contain',
            borderRadius: 8,
            background: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            left: item.startX - 28,
            top: item.startY - 28,
            animation: 'cart-fly 0.7s ease-in forwards',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

/** Fire a fly-to-cart animation from the given DOM element's position */
export function flyToCart(el: HTMLElement, imageUrl: string) {
  const rect = el.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent('cart-fly', {
      detail: { imageUrl, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    }),
  );
}
