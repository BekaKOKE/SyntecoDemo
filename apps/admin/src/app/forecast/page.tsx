'use client';

import { useState, useEffect } from 'react';
import { getStats, getInquiryStats, getRecentOrders } from '@/lib/api/admin';

export default function ForecastPage() {
  const [stats, setStats] = useState<any>(null);
  const [inq, setInq] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getInquiryStats().then(setInq).catch(() => {});
    getRecentOrders().then(setOrders).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header"><div><div className="page-title">Прогноз и аналитика</div><div className="page-sub">Обзор операционных показателей</div></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          ['📦', 'Товаров', stats?.productCount ?? '—'],
          ['📋', 'Заявок', inq?.total ?? '—'],
          ['💰', 'Выручка общ.', stats?.totalRevenue ? `${Number(stats.totalRevenue).toLocaleString('ru-RU')} ₸` : '—'],
          ['📊', 'Заказов', stats?.orderCount ?? '—'],
        ].map(([i, l, v]) => (
          <div key={l} className="card stat-card" style={{ padding: 20 }}>
            <div className="eyebrow">{i} {l}</div>
            <div className="num" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Заявки</h3>
          {[['Сегодня', inq?.todayCreated],['Вчера', inq?.yesterdayCreated],['Конверсия', inq?.conversionRate ? `${inq.conversionRate}%` : '—'],['Средний чек', inq?.avgCheck ? `${Number(inq.avgCheck).toLocaleString('ru-RU')} ₸` : '—']].map(([l,v]) => (
            <div key={l as string} className="hairb" style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 12 }}>{l}</span><span className="num" style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Последние заказы</h3>
          {orders.length === 0 ? <p className="muted" style={{ fontSize: 13 }}>Заказов пока нет</p> :
            orders.slice(0, 5).map(o => (
              <div key={o.id} className="hairb" style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>{o.orderNumber}</span>
                <span className="num">{Number(o.total).toLocaleString('ru-RU')} ₸</span>
                <span className="pill" style={{ fontSize: 10 }}>{o.status}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>График активности</h3>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Детальная аналитика появится после накопления данных по заявкам и заказам.</p>
      </div>
    </div>
  );
}
