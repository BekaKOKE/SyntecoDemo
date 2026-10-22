'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AI } from '@/lib/icons';
import { getStats, getRecentOrders, getCategories, type AdminStats, type RecentOrder } from '@/lib/api/admin';
import { fmtTng } from '@/lib/formatters';

/* ── Sparkline ────────────────────────────────────────── */
function Spark({ values, color = "var(--red)", w = 90, h = 32 }: { values: number[]; color?: string; w?: number; h?: number }) {
  if (!values.length) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const pad = 2;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`${pts.join(" ")} ${w - pad},${h - pad} ${pad},${h - pad}`} fill={color} opacity="0.10" />
    </svg>
  );
}

/* ── StatCard (real data) ─────────────────────────────── */
const STAT_ROUTES = { products: '/products', orders: '/orders', users: '/customers', revenue: '/reports' } as const;

function StatCard({ label, value, delta, up, sparkline, tone, icon }: {
  label: string; value: string; delta: string; up: boolean; sparkline: number[]; tone: string;
  icon: 'products' | 'orders' | 'users' | 'revenue';
}) {
  const router = useRouter();
  const toneColor: Record<string, string> = { red: "var(--red)", ink: "var(--ink)", info: "var(--info)", ok: "var(--ok)" };
  const toneLight: Record<string, string> = { red: "var(--red-light)", ink: "var(--surface-2)", info: "var(--info-light)", ok: "var(--ok-light)" };
  const color = toneColor[tone] || "var(--red)";
  const light = toneLight[tone] || "var(--red-light)";
  const IconComp = { products: AI.box, orders: AI.cart, users: AI.users, revenue: AI.chart }[icon];

  return (
    <button type="button" className="stat-card fade-up" onClick={() => router.push(STAT_ROUTES[icon])}
      style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
      title={`Перейти в ${label.toLowerCase()}`}>
      <div className="stat-bar" style={{ background: color }} />
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div className="stat-icon" style={{ background: light, color: color }}><IconComp /></div>
        <Spark values={sparkline} color={color} w={90} h={32} />
      </div>
      <div className="stat-value num">{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-delta ${up ? "" : "down"}`}>
        {up ? <AI.arrUp /> : <AI.arrDown />}{delta}
      </div>
    </button>
  );
}

/* ── ActivityFeed (real recent orders) ────────────────── */
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает', confirmed: 'Подтверждён', processing: 'В обработке',
  picking: 'Сборка', packed: 'Упакован', shipped: 'Отправлен',
  delivered: 'Доставлен', cancelled: 'Отменён', returned: 'Возврат',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--warn)', confirmed: 'var(--info)', processing: 'var(--info)',
  picking: 'var(--warn)', packed: 'var(--warn)', shipped: 'var(--info)',
  delivered: 'var(--ok)', cancelled: 'var(--red)', returned: 'var(--red)',
};

function ActivityFeed({ orders }: { orders: RecentOrder[] }) {
  if (!orders.length) {
    return (
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow">Лента событий</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>Последние заказы</div>
        <div className="muted" style={{ marginTop: 24, textAlign: 'center', padding: 40 }}>Заказов пока нет</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">Лента событий</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>Последние заказы</div>
        </div>
      </div>
      <div>
        {orders.map((o, i) => (
          <div key={o.id} className="row-gap" style={{ gap: 14, padding: "10px 0", borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : 0 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-2)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, border: "1px solid var(--border)",
              }}>{o.orderNumber.slice(-2)}</div>
              <span style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: 999,
                background: STATUS_COLORS[o.status] || "var(--ink)", border: "2px solid #fff" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--ink)" }}>
                <span className="mono" style={{ fontWeight: 700 }}>{o.orderNumber}</span>
                <span style={{ color: "var(--ink-3)" }}> · </span>
                <span className="num" style={{ fontWeight: 600 }}>{fmtTng(Number(o.total))} ₸</span>
              </div>
              <div className="row-gap" style={{ gap: 8, marginTop: 3 }}>
                <span className="muted" style={{ fontSize: 11 }}>{new Date(o.createdAt).toLocaleDateString('ru-RU')}</span>
                <span className="pill" style={{ fontSize: 10, height: 18, padding: "0 7px" }}>{STATUS_LABELS[o.status] || o.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── QuickActions ─────────────────────────────────────── */
function QuickActions() {
  const router = useRouter();
  const actions = [
    { id: "add-product",  label: "Новый товар",      icon: AI.box,  desc: "Добавить SKU в каталог",       action: () => router.push('/products/new') },
    { id: "new-order",    label: "Создать заказ",    icon: AI.cart, desc: "Оформить в магазине",           action: () => window.open('http://localhost:3001', '_blank') },
    { id: "new-inquiry",  label: "Новая заявка",     icon: AI.msg,  desc: "Входящий запрос от клиента",   action: () => router.push('/inquiries') },
    { id: "manage-stock", label: "Склад",             icon: AI.warehouse, desc: "Остатки и перемещение",  action: () => router.push('/forecast') },
  ];
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="eyebrow">Быстрые действия</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.id}
              onClick={a.action}
              style={{
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: 10, padding: 14, textAlign: "left",
                cursor: "pointer", transition: "border-color .15s ease, box-shadow .15s ease, transform .12s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.boxShadow = "0 6px 20px -10px var(--red)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--red-light)", color: "var(--red)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Icon /></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{a.label}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, fontWeight: 500 }}>{a.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── CategoryList ─────────────────────────────────────── */
function CategoryList({ categories }: { categories: any[] }) {
  if (!categories.length) return null;

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">Категории</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>{categories.length} категорий</div>
        </div>
        <button className="btn btn-ghost btn-sm">Все категории <AI.arrR /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {categories.slice(0, 14).map((c: any) => (
          <div key={c.id} className="row between" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>{c.name}</span>
            <span className="mono num" style={{ fontSize: 11, color: "var(--ink-4)" }}>{c.productCount ?? 0} SKU</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard Page ───────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, o, c] = await Promise.all([
          getStats(),
          getRecentOrders(),
          getCategories(),
        ]);
        setStats(s);
        setOrders(o);
        setCategories(c);
      } catch {
        // token may have expired — auth guard will redirect
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats ? [
    { label: "Товаров в каталоге", value: fmtTng(stats.productCount), delta: `${stats.brandCount} брендов`, up: true, sparkline: [], tone: "red", icon: 'products' as const },
    { label: "Заказов", value: String(stats.orderCount), delta: `${stats.userCount} пользователей`, up: true, sparkline: [], tone: "ink", icon: 'orders' as const },
    { label: "Пользователей", value: String(stats.userCount), delta: "активные", up: true, sparkline: [], tone: "info", icon: 'users' as const },
    { label: "Выручка", value: fmtTng(Number(stats.totalRevenue)) + ' ₸', delta: `${stats.categoryCount} категорий`, up: true, sparkline: [], tone: "ok", icon: 'revenue' as const },
  ] : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Дашборд</div>
          <div className="page-sub">
            {loading ? 'Загрузка…' : `${stats?.productCount ?? 0} товаров · ${stats?.orderCount ?? 0} заказов · ${stats?.brandCount ?? 0} брендов`}
          </div>
        </div>
        <div className="row-gap" style={{ gap: 8 }}>
          <button onClick={() => window.open('http://localhost:3001', '_blank')} className="btn btn-primary"><AI.plus /> Новый заказ</button>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14, marginTop: 14 }}>
        <ActivityFeed orders={orders} />
        <CategoryList categories={categories} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, marginTop: 14 }}>
        <QuickActions />
      </div>
    </div>
  );
}
