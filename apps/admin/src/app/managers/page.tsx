'use client';

import { useState, useEffect } from 'react';
import { AI } from '@/lib/icons';
import { getUsers } from '@/lib/api/admin';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Супер-админ', admin: 'Администратор', manager: 'Менеджер',
  customer_admin: 'Админ клиента', customer_buyer: 'Закупщик', customer_viewer: 'Наблюдатель',
};

export default function ManagersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(res => { setUsers(res?.data ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (search && !`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Менеджеры и пользователи</div><div className="page-sub">{users.length} пользователей в системе</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Поиск…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200, height: 34, fontSize: 12 }} />
          <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 160, height: 34, fontSize: 12, fontFamily: 'inherit' }}>
            <option value="">Все роли</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="btn btn-primary btn-sm"><AI.plus /> Пригласить</button>
        </div>
      </div>
      {loading ? <div className="card" style={{ padding: 60, textAlign: 'center' }}><div className="skeleton" style={{ height: 200 }} /></div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', margin: 0 }}>
            <thead><tr>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>Пользователь</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>Email</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>Роль</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>Статус</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-light)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                        {`${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }}>{u.email}</td>
                  <td style={{ padding: '10px 16px' }}><span className="pill" style={{ fontSize: 10, background: u.role === 'super_admin' ? 'var(--red-light)' : 'var(--color-surface-2)', color: u.role === 'super_admin' ? 'var(--red)' : 'var(--ink-3)' }}>{ROLE_LABELS[u.role] || u.role}</span></td>
                  <td style={{ padding: '10px 16px' }}><span className={`pill ${u.isActive !== false ? 'ok' : 'warn'}`} style={{ fontSize: 10 }}>{u.isActive !== false ? 'Активен' : 'Заблокирован'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Пользователи не найдены</div>}
        </div>
      )}
    </div>
  );
}
