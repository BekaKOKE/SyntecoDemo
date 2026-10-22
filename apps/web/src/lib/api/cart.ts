import { apiFetch } from './client';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
}

const SESSION_KEY = 'synteco_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function getSessionIdHeader(): string {
  return getSessionId();
}

export async function getCart(token?: string): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (!token) headers['X-Session-Id'] = getSessionId();
  return apiFetch<Cart>('/cart', { headers });
}

export async function addToCart(productId: string, quantity: number = 1, token?: string): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (!token) headers['X-Session-Id'] = getSessionId();
  return apiFetch<Cart>('/cart/items', {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(itemId: string, quantity: number, token?: string): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (!token) headers['X-Session-Id'] = getSessionId();
  return apiFetch<Cart>(`/cart/items/${itemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: string, token?: string): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (!token) headers['X-Session-Id'] = getSessionId();
  return apiFetch<Cart>(`/cart/items/${itemId}`, { method: 'DELETE', headers });
}

export async function clearCart(token?: string): Promise<Cart> {
  const headers: Record<string, string> = {};
  if (!token) headers['X-Session-Id'] = getSessionId();
  return apiFetch<Cart>('/cart', { method: 'DELETE', headers });
}
