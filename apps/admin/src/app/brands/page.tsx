'use client';

import { useState, useEffect } from 'react';
import { getBrands } from '@/lib/api/admin';

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands().then(d => { setBrands(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = brands.filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Бренды</div>
          <div className="page-sub">{brands.length} производителей в каталоге</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Поиск бренда…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, height: 34, fontSize: 12 }} />
        </div>
      </div>
      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}><div className="skeleton" style={{ height: 200 }} /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', margin: 0 }}>
            <thead><tr>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>Название</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600 }}>Товаров</th>
            </tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }} className="mono">{b.slug}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, textAlign: 'right' }} className="num">{b._count?.products ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>{search ? 'Бренды не найдены' : 'Нет брендов в каталоге'}</div>}
        </div>
      )}
    </div>
  );
}
