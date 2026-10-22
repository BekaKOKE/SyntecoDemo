'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { isManagerRole } from '@/lib/roles';

const TABS = [
  { id: 'dashboard', n: 'Дашборд',  k: '1' },
  { id: 'products',  n: 'Товары',   k: '2' },
  { id: 'inquiries', n: 'Заявки',   k: '3' },
  { id: 'crm',       n: 'Воронка',  k: '4' },
  { id: 'customers', n: 'Клиенты',  k: '5' },
];

const MANAGER_TABS = [
  { id: 'inquiries', n: 'Заявки', k: '1' },
  { id: 'orders', n: 'Заказы', k: '2' },
];

export function ScreenTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const managerView = isManagerRole(user?.role);
  const currentScreen = pathname.split('/').pop() || 'dashboard';
  const tabs = managerView ? MANAGER_TABS : TABS;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      const map: Record<string, string> = managerView
        ? { '1': 'inquiries', '2': 'orders' }
        : { '1': 'dashboard', '2': 'products', '3': 'inquiries', '4': 'crm', '5': 'customers' };
      if (map[e.key]) router.push(`/${map[e.key]}`);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [managerView, router]);

  return (
    <nav className="screen-tabs" aria-label="Навигация по разделам">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => router.push(`/${t.id}`)}
          className={currentScreen === t.id ? 'active' : ''}
        >
          {t.n} <span className="kbd">{t.k}</span>
        </button>
      ))}
    </nav>
  );
}
