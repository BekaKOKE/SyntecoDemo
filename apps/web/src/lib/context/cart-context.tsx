'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, type Cart } from '@/lib/api/cart';
import { useAuth } from './auth-context';

interface CartState {
  cart: Cart;
  loading: boolean;
  justAdded: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const emptyCart: Cart = { id: '', items: [], itemCount: 0, totalAmount: 0 };

const CartContext = createContext<CartState>({
  cart: emptyCart,
  loading: true,
  justAdded: 0,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  refresh: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(0);
  const { token } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const c = await getCart(token ?? undefined);
      setCart(c);
    } catch { /* guest — empty cart */ }
    setLoading(false);
  }, [token]);

  // Hydrate cart on mount and when auth changes
  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const c = await addToCart(productId, quantity, token ?? undefined);
    setCart(c);
    setJustAdded(n => n + 1);
  }, [token]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const c = await updateCartItem(itemId, quantity, token ?? undefined);
    setCart(c);
  }, [token]);

  const removeItem = useCallback(async (itemId: string) => {
    const c = await removeCartItem(itemId, token ?? undefined);
    setCart(c);
  }, [token]);

  const clear = useCallback(async () => {
    const c = await clearCart(token ?? undefined);
    setCart(c);
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, loading, justAdded, addItem, updateItem, removeItem, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
