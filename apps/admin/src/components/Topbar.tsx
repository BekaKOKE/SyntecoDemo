'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AI } from '@/lib/icons';
import { useAuth } from '@/lib/context/auth-context';
import { isManagerRole } from '@/lib/roles';

const SCREEN_TITLES: Record<string, { t: string; c: string }> = {
  dashboard:  { t: "Дашборд",     c: "Обзор показателей за октябрь 2026" },
  products:   { t: "Товары",       c: "Каталог · 12 460 артикулов в базе" },
  inquiries:  { t: "Заявки",       c: "Входящие запросы клиентов" },
  orders:     { t: "Заказы",        c: "Все заказы в работе и архиве" },
  promotions: { t: "Промокоды",     c: "Скидки и стратегии расчёта" },
  categories: { t: "Категории",   c: "Структура каталога" },
  brands:     { t: "Бренды",        c: "504 производителя" },
  media:      { t: "Медиафайлы",  c: "Файловое хранилище" },
  crm:        { t: "Воронка",      c: "Конвейер сделок" },
  customers:  { t: "Клиенты",      c: "База B2B-клиентов" },
  forecast:   { t: "Прогноз продаж", c: "Аналитика и сценарии" },
  managers:   { t: "Менеджеры",   c: "Доступ и роли" },
  reports:    { t: "Отчёты",        c: "Финансы и операционка" },
  settings:   { t: "Настройки",   c: "Интеграции и параметры" },
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const managerView = isManagerRole(user?.role);
  const screen = pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const meta = SCREEN_TITLES[screen] ?? SCREEN_TITLES.dashboard!;
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger — visible only on tablet/mobile */}
        <button className="show-mobile" onClick={onMenuClick}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--ink)', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <div className="topbar-title">{meta.t}</div>
        <div className="topbar-crumbs">
          <Link href={managerView ? "/inquiries" : "/dashboard"} style={{ cursor: "pointer" }}>Synteco</Link>
          <span style={{ margin: "0 6px", color: "var(--ink-5)" }}>/</span>
          <span style={{ color: "var(--ink)" }}>{meta.c}</span>
        </div>
      </div>
      </div>
      <div className="row-gap" style={{ gap: 10 }}>
        {!managerView && (
          <div className="row-gap" style={{
            height: 36, padding: "0 12px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--surface-2)",
            gap: 10, minWidth: 280,
          }}>
            <AI.search style={{ color: "var(--ink-3)" }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Найти товар, клиента, заявку… Enter"
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}
            />
          </div>
        )}
        <button className="btn btn-secondary btn-sm" style={{ height: 36, position: "relative" }}>
          <AI.bell />
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: "var(--red)", border: "2px solid #fff" }} className="pulse" />
        </button>
        {!managerView && (
          <button onClick={() => window.open('http://localhost:3001', '_blank')} className="btn btn-primary btn-sm" style={{ height: 36 }}>
            <AI.plus /> Новый заказ
          </button>
        )}
      </div>
    </header>
  );
}
