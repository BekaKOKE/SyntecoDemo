'use client';

import { useState, useEffect } from 'react';
import { AI } from '@/lib/icons';
import { getStats, getInquiryStats } from '@/lib/api/admin';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [inq, setInq] = useState<any>(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getInquiryStats().then(setInq).catch(() => {});
  }, []);

  const sections = [
    { title: 'Каталог', rows: [['Товаров', stats?.productCount], ['Брендов', stats?.brandCount], ['Категорий', stats?.categoryCount]] },
    { title: 'Заявки', rows: [['Всего', inq?.total], ['Активных', inq?.active], ['Сегодня', inq?.todayCreated], ['Конверсия', inq?.conversionRate ? `${inq.conversionRate}%` : '—']] },
    { title: 'Заказы', rows: [['Всего', stats?.orderCount], ['Выручка общ.', stats?.totalRevenue ? `${Number(stats.totalRevenue).toLocaleString('ru-RU')} ₸` : '—']] },
    { title: 'Пользователи', rows: [['Всего', stats?.userCount]] },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Отчёты</div><div className="page-sub">Финансовые и операционные показатели</div></div>
        <button className="btn btn-secondary btn-sm" onClick={() => {
          const csv = sections.flatMap(s => s.rows.map(r => `${s.title},${r[0]},${r[1]}`)).join('\n');
          const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `report-${new Date().toISOString().slice(0,10)}.csv`; a.click();
          URL.revokeObjectURL(url);
        }}><AI.doc /> Экспорт CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {sections.map(s => (
          <div key={s.title} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{s.title}</h3>
            {s.rows.map(([l, v]) => (
              <div key={l} className="hairb" style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span className="muted">{l}</span>
                <span className="num" style={{ fontWeight: 600 }}>{v ?? '—'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
