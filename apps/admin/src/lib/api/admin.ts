/**
 * Admin API — real API calls to the NestJS backend.
 */
import { apiFetch } from './client';

// ── Common types matching API responses ──────────────────

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number;
  parentId: string | null;
  productCount: number;
  imageUrl: string | null;
}

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount?: number;
}

export interface WarehouseDTO {
  id: string;
  name: string;
  code: string;
  address: string | null;
}

export interface ProductDTO {
  id: string;
  variantId: string;
  title: string;
  description: string | null;
  brand: { id: string; name: string; slug: string };
  categories: { category: CategoryDTO }[];
  imageUrl: string | null;
  price: number;
  salePrice: number | null;
  availability: string;
  mpn: string | null;
  stock: { warehouse: { name: string; code: string }; quantity: number; reserved: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  company: { name: string; bin: string } | null;
  createdAt: string;
}

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

// ── Stats ──────────────────────────────────────────────

export interface AdminStats {
  productCount: number;
  brandCount: number;
  categoryCount: number;
  orderCount: number;
  userCount: number;
  totalRevenue: number;
}

export async function getStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats');
}

// ── Recent orders (for activity feed) ──────────────────

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  return apiFetch<RecentOrder[]>('/admin/recent-orders');
}

// ── Products (from real API) ───────────────────────────

export async function getProducts(params: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<ProductDTO>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') searchParams.set(k, String(v));
  });
  const qs = searchParams.toString();
  return apiFetch<PaginatedResponse<ProductDTO>>(`/products${qs ? `?${qs}` : ''}`);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
}

// ── Categories (from real API) ─────────────────────────

export async function getCategories(): Promise<CategoryDTO[]> {
  return apiFetch<CategoryDTO[]>('/categories');
}

// ── Brands (from real API) ─────────────────────────────

export async function getBrands(): Promise<BrandDTO[]> {
  return apiFetch<BrandDTO[]>('/brands');
}

export async function getWarehouses(): Promise<WarehouseDTO[]> {
  return apiFetch<WarehouseDTO[]>('/inventory/warehouses');
}

// ── Users/Customers (from real API) ────────────────────

export async function getUsers(): Promise<PaginatedResponse<UserDTO>> {
  return apiFetch<PaginatedResponse<UserDTO>>('/users');
}

// ── Inquiries (real API) ─────────────────────────────────

export interface InquiryDTO {
  id: string;
  inquiryNumber: string;
  companyName: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  items: Array<{ sku: string; name: string; quantity: number; unitPrice: number }>;
  itemCount: number;
  totalAmount: number;
  status: 'new' | 'in_progress' | 'quoted' | 'closed' | 'cancelled';
  priority: 'high' | 'normal' | 'low';
  notes: string | null;
  assignedTo: string | null;
  slaDueBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryListResponse {
  data: InquiryDTO[];
  meta: { total: number; page: number; limit: number; totalPages: number };
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

export async function getInquiryStats(): Promise<InquiryStats> {
  return apiFetch<InquiryStats>('/admin/inquiries/stats');
}

export async function getInquiries(params: Record<string, string | number | undefined> = {}): Promise<InquiryListResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') searchParams.set(k, String(v));
  });
  const qs = searchParams.toString();
  return apiFetch<InquiryListResponse>(`/admin/inquiries${qs ? `?${qs}` : ''}`);
}

export async function getInquiry(id: string): Promise<InquiryDTO> {
  return apiFetch<InquiryDTO>(`/admin/inquiries/${id}`);
}

export async function createInquiry(data: Partial<InquiryDTO>): Promise<InquiryDTO> {
  return apiFetch<InquiryDTO>('/admin/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInquiry(id: string, data: Partial<InquiryDTO>): Promise<InquiryDTO> {
  return apiFetch<InquiryDTO>(`/admin/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteInquiry(id: string): Promise<void> {
  return apiFetch<void>(`/admin/inquiries/${id}`, { method: 'DELETE' });
}

// ── Orders (real API) ────────────────────────────────────

export interface OrderItemDTO {
  id: string;
  productId: string;
  variantId: string | null;
  title: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
}

export interface OrderStatusEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  actor: string | null;
  comment: string | null;
  createdAt: string;
}

export interface OrderCustomerDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface OrderPaymentDTO {
  id: string;
  method: string;
  status: string;
  amount: number;
  externalId: string | null;
  message: string | null;
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  promoCode: string | null;
  discountStrategy: string | null;
  services: { code: string; label: string; amount: number }[];
  servicesTotal: number;
  paymentMethod: string | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  payments: OrderPaymentDTO[];
  notes: string | null;
  customer: OrderCustomerDTO | null;
  items: OrderItemDTO[];
  statusHistory: OrderStatusEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: OrderDTO[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getOrders(params: Record<string, string | number | undefined> = {}): Promise<OrderListResponse> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const qs = sp.toString();
  return apiFetch<OrderListResponse>(`/orders${qs ? `?${qs}` : ''}`);
}

export async function getOrder(id: string): Promise<OrderDTO> {
  return apiFetch<OrderDTO>(`/orders/${id}`);
}

export async function approveOrder(id: string): Promise<OrderDTO> {
  return apiFetch<OrderDTO>(`/orders/${id}/approve`, { method: 'POST', body: '{}' });
}

export async function cancelOrder(id: string, comment?: string): Promise<OrderDTO> {
  return apiFetch<OrderDTO>(`/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: comment || 'Cancelled by admin' }),
  });
}

export async function transitionOrder(id: string, status: string, comment?: string): Promise<OrderDTO> {
  return apiFetch<OrderDTO>(`/orders/${id}/transition`, {
    method: 'POST',
    body: JSON.stringify({ status, comment }),
  });
}

export async function getOrderTransitions(id: string): Promise<{ current: string; allowed: string[] }> {
  return apiFetch<{ current: string; allowed: string[] }>(`/orders/${id}/transitions`);
}

// ── Promotions (real API) ────────────────────────────────

export type PromotionStrategy = 'percentage' | 'fixed_amount' | 'volume_tier' | 'buy_x_get_y';

export interface PromotionParams {
  maxDiscount?: number;
  tiers?: { minQuantity: number; percent: number }[];
  buy?: number;
  free?: number;
}

export interface PromotionDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  strategy: PromotionStrategy;
  value: number;
  params: PromotionParams;
  minOrderAmount: number;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
}

export interface PromotionInput {
  code: string;
  name: string;
  description?: string;
  strategy: PromotionStrategy;
  value: number;
  params?: PromotionParams;
  minOrderAmount?: number;
  usageLimit?: number | null;
  isActive?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
}

export async function getPromotionStrategies(): Promise<{ type: PromotionStrategy; label: string }[]> {
  return apiFetch('/promotions/strategies');
}

export async function getPromotions(): Promise<PromotionDTO[]> {
  return apiFetch<PromotionDTO[]>('/promotions');
}

export async function createPromotion(data: PromotionInput): Promise<PromotionDTO> {
  return apiFetch<PromotionDTO>('/promotions', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePromotion(id: string, data: Partial<PromotionInput>): Promise<PromotionDTO> {
  return apiFetch<PromotionDTO>(`/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deletePromotion(id: string): Promise<void> {
  return apiFetch<void>(`/promotions/${id}`, { method: 'DELETE' });
}

// ── Settings (real API) ──────────────────────────────────

export async function getSettings(): Promise<Record<string, any>> {
  return apiFetch<Record<string, any>>('/admin/settings');
}

export async function updateSettings(data: Record<string, any>): Promise<any> {
  return apiFetch<any>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── CRM Pipeline (real API) ──────────────────────────────

export interface DealDTO {
  id: string;
  dealNumber: string;
  title: string;
  companyName: string;
  contactName: string | null;
  contactPhone: string | null;
  value: number;
  stage: string;
  priority: string;
  daysInStage: number;
  ownerId: string | null;
  ownerName: string | null;
  hot: boolean;
  notes: string | null;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineColumn {
  id: string;
  label: string;
  wip: number;
  sum: number;
  deals: DealDTO[];
}

export async function getPipeline(): Promise<PipelineColumn[]> {
  return apiFetch<PipelineColumn[]>('/admin/crm/pipeline');
}

export async function createDeal(data: Partial<DealDTO>): Promise<DealDTO> {
  return apiFetch<DealDTO>('/admin/crm/deals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDeal(id: string, data: Partial<DealDTO>): Promise<DealDTO> {
  return apiFetch<DealDTO>(`/admin/crm/deals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDeal(id: string): Promise<void> {
  return apiFetch<void>(`/admin/crm/deals/${id}`, { method: 'DELETE' });
}
