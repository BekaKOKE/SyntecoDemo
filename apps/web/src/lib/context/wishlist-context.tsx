'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface WishlistContextType {
  items: string[];
  isWished: (id: string) => boolean;
  toggle: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  isWished: () => false,
  toggle: () => {},
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('synteco_wishlist');
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('synteco_wishlist', JSON.stringify(items));
  }, [items]);

  const isWished = useCallback((id: string) => items.includes(id), [items]);
  const toggle = useCallback((id: string) => {
    setItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  return (
    <WishlistContext.Provider value={{ items, isWished, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
