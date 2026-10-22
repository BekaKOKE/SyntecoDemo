/**
 * Typed API contract — mirrors the NestJS Swagger/OpenAPI spec.
 * Generated from the API source. Update when endpoints change.
 *
 * Usage:
 *   import { api } from '@synteco/shared-api-client';
 *   const products = await api.products.list({ limit: 24 });
 *   const order = await api.orders.create({ notes: 'Test' });
 */

// ── Common Types ──────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errorCode: string;
  errors?: Record<string, string[]>;
  requestId?: string;
  timestamp: string;
}

// ── Auth ──────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  companyId?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

// ── Products ──────────────────────────────────────────

export interface Product {
  id: string;
  variantId: string;
  itemId?: string | null;
  title: string;
  description?: string | null;
  descriptionRu?: string | null;
  brand?: Brand | null;
  brandId: string;
  imageUrl?: string | null;
  price: number;
  salePrice?: number | null;
  availability: string;
  groupId?: string | null;
  hasVariations: boolean;
  mpn?: string | null;
  attributes: Record<string, string>;
  categories?: ProductCategory[];
  variants?: ProductVariant[];
  prices?: ProductPriceTier[];
  stock?: ProductStock[];
  images?: ProductImage[];
  documents?: ProductDocument[];
  specEntries?: ProductSpec[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  _count?: { products: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  parentId?: string | null;
  level: number;
  sortOrder: number;
  productCount: number;
  imageUrl?: string | null;
}

export interface ProductCategory {
  productId: string;
  categoryId: string;
  category?: Category;
}

export interface ProductVariant {
  id: string;
  productId: string;
  optionId?: string | null;
  optionName?: string | null;
  price?: number | null;
  inStock: boolean;
  imageUrl?: string | null;
}

export interface ProductPriceTier {
  id: string;
  tier: string;
  price: number;
  minQuantity: number;
  contractId?: string | null;
}

export interface ProductStock {
  warehouseId: string;
  quantity: number;
  reserved: number;
  warehouse?: Warehouse;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbUrl: string;
  alt?: string | null;
  sortOrder: number;
}

export interface ProductDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  fileSize?: number | null;
}

export interface ProductSpec {
  id: string;
  name: string;
  value: string;
  unit?: string | null;
  group?: string | null;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  availability?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface CreateProductRequest {
  variantId: string;
  title: string;
  brandId: string;
  price: number;
  description?: string;
  itemId?: string;
  salePrice?: number;
  mpn?: string;
  imageUrl?: string;
  availability?: string;
  attributes?: Record<string, string>;
  categoryIds?: string[];
  stock?: { warehouseId: string; quantity: number }[];
}

// ── Orders ────────────────────────────────────────────

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  notes?: string | null;
  customer?: OrderCustomer | null;
  items: OrderItem[];
  statusHistory: OrderStatusEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomer {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  title: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export interface OrderStatusEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  actor?: string | null;
  comment?: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  notes?: string;
}

// ── Cart ──────────────────────────────────────────────

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  title: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

// ── Search ────────────────────────────────────────────

export interface SearchResult {
  data: Product[];
  query: string;
  meta: PaginationMeta;
  engine?: string;
}

export interface AutocompleteSuggestion {
  label: string;
  value: string;
  type: string;
  price: number;
}

// ── CRM ───────────────────────────────────────────────

export interface Deal {
  id: string;
  dealNumber: string;
  title: string;
  companyName: string;
  contactName?: string | null;
  contactPhone?: string | null;
  value: number;
  stage: string;
  priority: string;
  daysInStage: number;
  ownerId?: string | null;
  ownerName?: string | null;
  hot: boolean;
  notes?: string | null;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineColumn {
  id: string;
  label: string;
  wip: number;
  sum: number;
  deals: Deal[];
}

// ── Inquiries ─────────────────────────────────────────

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  companyName: string;
  contactName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  items: InquiryItem[];
  itemCount: number;
  totalAmount: number;
  status: string;
  priority: string;
  notes?: string | null;
  assignedTo?: string | null;
  slaDueBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface InquiryStats {
  total: number;
  active: number;
  todayCreated: number;
  yesterdayCreated: number;
  todayDelta: number;
  avgResponseTime: number;
  conversionRate: number;
  avgCheck: number;
}

// ── Admin ─────────────────────────────────────────────

export interface AdminStats {
  productCount: number;
  brandCount: number;
  categoryCount: number;
  orderCount: number;
  userCount: number;
  totalRevenue: number;
}

// ── Pricing ───────────────────────────────────────────

export interface ResolvedPrice {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  tier: string;
  originalPrice: number;
  discountPercent: number;
  savings: number;
  quantity: number;
  unit: string;
}
