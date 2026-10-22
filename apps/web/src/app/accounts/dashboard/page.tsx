'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { ORDER_STATUS_LABELS } from '@/lib/api/orders';

export default function AccountDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      import('@/lib/api/client').then(({ apiFetch }) => {
        apiFetch<{ data: any[] }>('/orders').then(d => setOrders(d.data || [])).catch(() => {});
        apiFetch<{ data: any[] }>('/admin/inquiries/my').then(d => {
          const list = Array.isArray(d) ? d : d.data || [];
          setInquiries(list);
        }).catch(() => {});
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container-site" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: 'var(--color-ink-4)' }}><Icons.lock width={40} height={40} /></div>
        <h1>Требуется авторизация</h1>
        <p className="muted" style={{ marginTop: 8 }}>Войдите в личный кабинет для доступа.</p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Войти</Link>
      </div>
    );
  }

  const companyName = (user as any)?.company?.name || '—';

  const stats: { icon: React.ReactNode; value: string; label: string }[] = [
    { icon: <Icons.package width={24} height={24} />, value: `${orders.length}`, label: 'Заказов' },
    { icon: <Icons.clipboard width={24} height={24} />, value: `${inquiries.length}`, label: 'Запросов' },
    { icon: <Icons.building width={24} height={24} />, value: companyName, label: 'Компания' },
    { icon: <Icons.star width={22} height={22} />, value: user?.role === 'customer_admin' ? 'Админ' : 'Пользователь', label: 'Роль' },
  ];

  const quickLinks: { icon: React.ReactNode; title: string; desc: string; href: string }[] = [
    { icon: <Icons.clipboard width={28} height={28} />, title: 'Мои запросы', desc: 'Отслеживайте статус запросов КП', href: '/accounts/inquiries' },
    { icon: <Icons.package width={28} height={28} />, title: 'Мои заказы', desc: 'История и статусы заказов', href: '/accounts/orders' },
    { icon: <Icons.bell width={28} height={28} />, title: 'Уведомления', desc: 'Статусы заказов и оплат', href: '/accounts/notifications' },
    { icon: <Icons.user width={28} height={28} />, title: 'Профиль', desc: 'Настройки аккаунта и компании', href: '/accounts/profile' },
  ];

  return (
    <div className="container-site" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 600 }}>Личный кабинет</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>Добро пожаловать, {user?.firstName} {user?.lastName}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/accounts/profile" className="btn btn-secondary btn-sm">Профиль</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ marginBottom: 8, color: 'var(--color-ink-3)' }}>{s.icon}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {quickLinks.map(q => (
          <Link key={q.title} href={q.href} className="card" style={{ padding: 28, transition: 'border-color .15s' }}>
            <div style={{ marginBottom: 12, color: 'var(--color-accent)' }}>{q.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{q.title}</div>
            <div className="muted" style={{ fontSize: 13 }}>{q.desc}</div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Последние заказы</h2>
      {orders.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ marginBottom: 10, color: 'var(--color-ink-4)' }}><Icons.package width={36} height={36} /></div>
          <p className="muted">У вас пока нет заказов.</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Перейти в каталог</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', margin: 0 }}>
            <thead><tr><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Номер</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Дата</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Сумма</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Статус</th></tr></thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{o.orderNumber}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }} className="num">{formatPrice(o.total)}</td>
                  <td style={{ padding: '10px 16px' }}><span className="pill" style={{ fontSize: 10 }}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
