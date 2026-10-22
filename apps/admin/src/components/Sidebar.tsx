'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AI } from '@/lib/icons';
import { clearTokens } from '@/lib/api/client';
import { getStats, getInquiryStats, getOrders } from '@/lib/api/admin';
import { useAuth } from '@/lib/context/auth-context';
import { isManagerRole } from '@/lib/roles';

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return String(n);
}

export function Sidebar({ className = '', onLinkClick }: { className?: string; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentScreen = pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const managerView = isManagerRole(user?.role);
  const [counts, setCounts] = useState({ products: 0, orders: 0, inquiries: 0 });

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';
  const roleLabel = user?.role === 'super_admin'
    ? 'Супер-админ'
    : user?.role === 'admin'
      ? 'Администратор'
      : user?.role === 'manager'
        ? 'Менеджер'
        : user?.role || '';

  useEffect(() => {
    let active = true;

    if (managerView) {
      Promise.all([
        getInquiryStats().catch(() => null),
        getOrders({ limit: 1 }).catch(() => null),
      ]).then(([inqStats, orders]) => {
        if (!active) return;
        setCounts({
          products: 0,
          orders: orders?.meta.total ?? 0,
          inquiries: inqStats?.total ?? 0,
        });
      }).catch(() => {});
      return () => { active = false; };
    }

    Promise.all([
      getStats().catch(() => null),
      getInquiryStats().catch(() => null),
    ]).then(([stats, inqStats]) => {
      if (!active) return;
      setCounts({
        products: stats?.productCount ?? 0,
        orders: stats?.orderCount ?? 0,
        inquiries: inqStats?.total ?? 0,
      });
    }).catch(() => {});

    return () => { active = false; };
  }, [managerView]);

  interface NavItem { id: string; name: string; icon: (p: any) => React.JSX.Element; count?: string | number; badge?: string | number; }
  const FULL_SECTIONS: { label: string; items: NavItem[] }[] = [
    { label: "Основное", items: [
      { id: "dashboard",  name: "Дашборд",      icon: AI.dashboard },
      { id: "products",   name: "Товары",        icon: AI.box, count: fmtCount(counts.products) },
      { id: "inquiries",  name: "Заявки",        icon: AI.msg,  count: counts.inquiries },
      { id: "orders",     name: "Заказы",         icon: AI.cart, count: counts.orders },
      { id: "promotions", name: "Промокоды",     icon: AI.fire },
    ]},
    { label: "Каталог", items: [
      { id: "categories", name: "Категории",   icon: AI.warehouse },
      { id: "brands",     name: "Бренды",        icon: AI.box },
      { id: "media",      name: "Медиафайлы",   icon: AI.doc },
    ]},
    { label: "CRM", items: [
      { id: "crm",        name: "Воронка",       icon: AI.pipeline },
      { id: "customers",  name: "Клиенты",       icon: AI.users },
      { id: "forecast",   name: "Прогноз",        icon: AI.chart },
    ]},
    { label: "Команда", items: [
      { id: "managers",   name: "Менеджеры",    icon: AI.users },
      { id: "reports",    name: "Отчёты",        icon: AI.doc },
      { id: "settings",   name: "Настройки",     icon: AI.settings },
    ]},
  ];
  const SECTIONS = managerView
    ? [{ label: "Менеджер", items: FULL_SECTIONS[0]!.items.filter((it) => it.id === 'inquiries' || it.id === 'orders') }]
    : FULL_SECTIONS;

  const handleLogout = () => {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <aside className={`sidebar ${className}`}>
      <Link href={managerView ? "/inquiries" : "/dashboard"} className="sidebar-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="sidebar-logo-mark">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
            <path d="M9 10 L22 10 L22 14 L13 14 L13 15 L22 15 L22 22 L9 22 L9 18 L18 18 L18 17 L9 17 Z" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-title">Synteco</div>
          <div className="sidebar-logo-sub">Панель управления</div>
        </div>
      </Link>

      <nav className="sidebar-nav">
        {SECTIONS.map((s) => (
          <div key={s.label}>
            <div className="sidebar-section-label">{s.label}</div>
            {s.items.map((it) => {
              const active = currentScreen === it.id;
              const Icon = it.icon;
              return (
                <Link
                  key={it.id}
                  href={`/${it.id}`}
                  className={`nav-item ${active ? "active" : ""}`}
                  onClick={onLinkClick}
                >
                  <Icon />
                  <span>{it.name}</span>
                  {it.badge != null && <span className="badge">{it.badge}</span>}
                  {it.count != null && !it.badge && (
                    <span className="mono num" style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)" }}>{it.count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="user-card">
          <div className="user-avatar">{initials || '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName || 'Пользователь'}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>{roleLabel}</div>
          </div>
          <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 4 }} title="Выйти">
            <AI.logout />
          </button>
        </div>
      </div>
    </aside>
  );
}
