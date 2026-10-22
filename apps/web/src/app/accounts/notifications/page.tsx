'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Icons } from '@/lib/icons';
import { formatDateTime } from '@/lib/format';
import {
  getNotifications, markNotificationRead, markAllNotificationsRead, CHANNEL_LABELS, NOTIFICATIONS_CHANGED,
  type Notification,
} from '@/lib/api/notifications';

const TYPE_ICONS: Record<string, (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  order_created: Icons.package,
  order_status_changed: Icons.truck,
  payment_succeeded: Icons.money,
  payment_failed: Icons.warning,
};

export default function AccountNotifications() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const load = useCallback(() => {
    getNotifications()
      .then(d => { setItems(d.data || []); setUnread(d.unread ?? 0); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const changed = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));

  const markRead = async (n: Notification) => {
    if (n.readAt) return;
    setItems(list => list.map(x => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    setUnread(u => Math.max(0, u - 1));
    try { await markNotificationRead(n.id); } catch { load(); }
    changed();
  };

  const markAll = async () => {
    const now = new Date().toISOString();
    setItems(list => list.map(x => ({ ...x, readAt: x.readAt ?? now })));
    setUnread(0);
    try { await markAllNotificationsRead(); } catch { load(); }
    changed();
  };

  if (authLoading) {
    return <div className="container-site muted" style={{ padding: '64px 24px', textAlign: 'center' }}>Загрузка…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container-site" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: 'var(--color-ink-4)' }}><Icons.lock width={40} height={40} /></div>
        <h1>Требуется авторизация</h1>
        <p className="muted" style={{ marginTop: 8 }}>Войдите в личный кабинет, чтобы видеть уведомления.</p>
        <Link href="/login?redirect=/accounts/notifications" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Войти</Link>
      </div>
    );
  }

  const visible = onlyUnread ? items.filter(n => !n.readAt) : items;

  return (
    <div className="container-site" style={{ padding: '40px 24px 72px', maxWidth: 880 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <Link href="/accounts/dashboard" className="muted" style={{ fontSize: 12 }}>← Личный кабинет</Link>
          <h1 style={{ fontSize: 30, fontWeight: 760, marginTop: 8, letterSpacing: 0 }}>
            Уведомления {unread > 0 && <span className="num" style={{ fontSize: 16, color: 'var(--color-accent)', verticalAlign: 'middle' }}>· {unread} новых</span>}
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>События по заказам и оплатам. Дублируются на email, SMS и в личный кабинет.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <button onClick={() => setOnlyUnread(v => !v)} className={onlyUnread ? 'btn btn-secondary' : 'btn btn-ghost'}>
            {onlyUnread ? 'Показать все' : 'Только непрочитанные'}
          </button>
          <button onClick={markAll} disabled={unread === 0} className="btn btn-secondary"><Icons.check /> Прочитать все</button>
        </div>
      </div>

      {!loaded ? (
        <div className="card muted" style={{ padding: 40, textAlign: 'center' }}>Загрузка…</div>
      ) : visible.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, color: 'var(--color-ink-4)' }}><Icons.bell width={36} height={36} /></div>
          <p className="muted">{onlyUnread ? 'Непрочитанных уведомлений нет.' : 'Уведомлений пока нет.'}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {visible.map((n, i) => {
            const Icon = TYPE_ICONS[n.type] ?? Icons.bell;
            const isUnread = !n.readAt;
            return (
              <div key={n.id} className={i > 0 ? 'hairt' : undefined} style={{
                display: 'flex', gap: 14, padding: '16px 20px',
                background: isUnread ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                boxShadow: isUnread ? 'inset 3px 0 0 var(--color-accent)' : undefined,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--color-surface)', border: '1px solid var(--color-hair)', color: isUnread ? 'var(--color-accent)' : 'var(--color-ink-3)',
                }}>
                  <Icon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: isUnread ? 700 : 500 }}>{n.title}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-2)', marginTop: 4, lineHeight: 1.5 }}>{n.body}</p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                    {n.channels.map(c => (
                      <span key={c} className="pill mono" style={{ fontSize: 10, height: 20 }}>{CHANNEL_LABELS[c] ?? c}</span>
                    ))}
                    <span style={{ flex: 1 }} />
                    {n.orderId && (
                      <Link href={`/accounts/orders?order=${n.orderId}`} onClick={() => markRead(n)} className="btn btn-ghost btn-sm">
                        К заказу <Icons.chevR />
                      </Link>
                    )}
                    {isUnread && (
                      <button onClick={() => markRead(n)} className="btn btn-ghost btn-sm"><Icons.check /> Прочитано</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
