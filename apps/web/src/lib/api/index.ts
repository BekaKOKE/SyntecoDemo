export { getProducts, getProduct, getProductBySku } from './products';
export type { Product, ProductListResponse, ProductFilters } from './products';

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart, getSessionIdHeader } from './cart';
export type { Cart, CartItem } from './cart';

export { login, register, logout, getMe, getToken, clearAuth } from './auth';
export type { TokenResponse, User } from './auth';

export { getCategories, getCategoryTree, getCategory } from './categories';
export type { Category } from './categories';

export { search, autocomplete } from './search';

export { apiFetch } from './client';
