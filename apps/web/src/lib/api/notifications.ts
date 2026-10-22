import { apiFetch } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  channels: string[];
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Header badge listens for this to refresh the unread counter. */
export const NOTIFICATIONS_CHANGED = 'synteco:notifications-changed';

export const CHANNEL_LABELS: Record<string, string> = {
  email: 'email',
  sms: 'sms',
  in_app: 'in-app',
  websocket: 'push',
};

export const getNotifications = () => apiFetch<{ data: Notification[]; unread: number }>('/notifications');
export const markNotificationRead = (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'POST', body: '{}' });
export const markAllNotificationsRead = () => apiFetch('/notifications/read-all', { method: 'POST', body: '{}' });
