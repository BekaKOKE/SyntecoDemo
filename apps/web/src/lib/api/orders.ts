import { apiFetch } from './client';
import { NOTIFICATIONS_CHANGED } from './notifications';

export type PaymentMethodCode = 'kaspi' | 'halyk_card' | 'bank_invoice' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentMethod {
  method: PaymentMethodCode;
  displayName: string;
  description: string;
  requiredFields: string[];
}

export interface OrderServiceOption {
  code: string;
  name: string;
  description: string;
  priceHint: string;
}

export interface MoneyLine {
  code: string;
  label: string;
  amount: number;
}

export interface Quote {
  itemCount: number;
  subtotal: number;
  promoCode: string | null;
  discountStrategy: string | null;
  discountDescription: string | null;
  discount: number;
  services: MoneyLine[];
  servicesTotal: number;
  vat: number;
  total: number;
  lines: MoneyLine[];
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
  imageUrl: string | null;
}

export interface OrderPayment {
  id: string;
  method: PaymentMethodCode;
  status: PaymentStatus;
  amount: number;
  externalId: string | null;
  message: string | null;
  createdAt: string;
}

export interface OrderStatusEntry {
  id?: string;
  fromStatus: string;
  toStatus: string;
  actor: string | null;
  comment: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  promoCode: string | null;
  discountStrategy: string | null;
  services: MoneyLine[];
  servicesTotal: number;
  paymentMethod: PaymentMethodCode | null;
  paymentStatus: PaymentStatus;
  payments: OrderPayment[];
  notes: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusEntry[];
  createdAt: string;
}

export interface PaymentResult {
  status: 'paid' | 'pending' | 'failed';
  message: string;
  transactionId: string | null;
}

export type OrderWithPayment = Order & { lastPayment?: PaymentResult };

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  picking: 'Комплектация',
  packed: 'Упакован',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  returned: 'Возврат',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  failed: 'Оплата не прошла',
  refunded: 'Возврат средств',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodCode, string> = {
  kaspi: 'Kaspi Pay',
  halyk_card: 'Банковская карта',
  bank_invoice: 'Счёт для юрлиц',
  cash_on_delivery: 'При получении',
};

const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) });

/** Order actions create notifications on the server — refresh the header badge. */
function notificationsChanged<T>(result: T): T {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
  return result;
}

export const getPaymentMethods = () => apiFetch<PaymentMethod[]>('/payments/methods');
export const getOrderServices = () => apiFetch<OrderServiceOption[]>('/orders/services');

export const getQuote = (body: { promoCode?: string; services?: string[] }) =>
  apiFetch<Quote>('/orders/quote', json(body));

export const createOrder = (body: {
  notes?: string;
  promoCode?: string;
  services?: string[];
  paymentMethod?: PaymentMethodCode;
  paymentDetails?: Record<string, string>;
}) => apiFetch<OrderWithPayment>('/orders', json(body)).then(notificationsChanged);

export const payOrder = (id: string, paymentMethod: PaymentMethodCode, paymentDetails?: Record<string, string>) =>
  apiFetch<OrderWithPayment>(`/orders/${id}/pay`, json({ paymentMethod, paymentDetails })).then(notificationsChanged);

export const cancelOrder = (id: string, reason: string) =>
  apiFetch<Order>(`/orders/${id}/cancel`, json({ reason })).then(notificationsChanged);

export const getOrders = (page = 1, limit = 20) =>
  apiFetch<{ data: Order[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(`/orders?page=${page}&limit=${limit}`);

export const getOrder = (id: string) => apiFetch<Order>(`/orders/${encodeURIComponent(id)}`);
