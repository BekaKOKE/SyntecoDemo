'use client';

import { useState, useEffect, useCallback } from 'react';
import { AI } from '@/lib/icons';
import { getUsers } from '@/lib/api/admin';
import { useToast } from '@/components/Toast';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Супер-админ', admin: 'Администратор', manager: 'Менеджер',
  customer_admin: 'Админ клиента', customer_buyer: 'Закупщик', customer_viewer: 'Наблюдатель',
};

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', phone: '', role: 'customer_buyer' };

// ── Invite modal ──────────────────────────────────────────────────

function InviteModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) setForm(EMPTY_FORM); setError(''); }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.email || !form.password || !form.firstName) { setError('Заполните обязательные поля'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Ошибка'); }
      onSaved(); onClose();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="invite-user-title" style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.4)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <button type="button" onClick={onClose} aria-label="Закрыть приглашение пользователя" style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }} />
      <div style={{ position: 'relative', width: 480, maxHeight: 'calc(100vh - 40px)', overflow: 'auto', background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-3)', padding: 30 }}>
        <div id="invite-user-title" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 20 }}>Пригласить пользователя</div>
        {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FF label="Имя *" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
            <FF label="Фамилия *" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
          </div>
          <FF label="Email *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          <FF label="Пароль *" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} type="password" />
          <FF label="Телефон" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <div>
            <label htmlFor="invite-user-role" className="field-label">Роль</label>
            <select id="invite-user-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              style={{ width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="row-gap" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary">Отмена</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>{saving ? '…' : 'Пригласить'}</button>
        </div>
      </div>
    </div>
  );
}

function FF({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="field-label" style={{ display: 'block' }}>
      {label}
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', marginTop: 4, height: 38, padding: '0 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
    </label>
  );
}

// ── Detail modal ──────────────────────────────────────────────────

function DetailModal({ user, onClose }: { user: any; onClose: () => void }) {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.4)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <button type="button" onClick={onClose} aria-label="Закрыть карточку пользователя" style={{ position: 'absolute', inset: 0, border: 0, background: 'transparent', cursor: 'default' }} />
      <div style={{ position: 'relative', width: 480, maxHeight: 'calc(100vh - 40px)', overflow: 'auto', background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-3)', padding: 30 }}>
        <div className="row-gap" style={{ gap: 16, marginBottom: 24, alignItems: 'center' }}>
          <div className="user-avatar" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18, background: 'var(--ink)', color: '#fff' }}>{initials || '?'}</div>
          <div>
            <div id="customer-detail-title" style={{ fontSize: 20, fontWeight: 800 }}>{user.firstName} {user.lastName}</div>
            <div className="muted" style={{ fontSize: 13 }}>{ROLE_LABELS[user.role] || user.role}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
          {[ ['Email', user.email], ['Телефон', user.phone || '—'], ['ID', user.id],
             ['Статус', user.isActive ? 'Активен' : 'Заблокирован'],
             ['Последний вход', user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ru-RU') : 'Ни разу'],
             ['Создан', new Date(user.createdAt).toLocaleDateString('ru-RU')],
          ].map(([label, val]) => (
            <div key={label as string} className="row between" style={{ padding: '6px 0', borderBottom: '1px solid var(--hair)' }}>
              <span className="muted">{label}</span>
              <span style={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary">Закрыть</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function CustomersPage() {
  const { pushToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getUsers().then(res => { setUsers(res?.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  let rows = users;
  if (filterRole !== 'all') rows = rows.filter(u => u.role === filterRole);
  if (q.trim()) {
    const qq = q.toLowerCase();
    rows = rows.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq));
  }

  const roles = ['all', ...new Set(users.map(u => u.role))];

  // ── CSV export ─────────────────────────────────────────
  const exportCSV = () => {
    const header = 'Имя,Фамилия,Email,Телефон,Роль,Статус,Создан';
    const lines = rows.map(u =>
      [u.firstName, u.lastName, u.email, u.phone || '', ROLE_LABELS[u.role] || u.role,
       u.isActive ? 'Активен' : 'Заблокирован', new Date(u.createdAt).toLocaleDateString('ru-RU')]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    pushToast(`Экспортировано ${lines.length} пользователей`, 'success');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Клиенты</div>
          <div className="page-sub">{users.length} зарегистрированных пользователей</div>
        </div>
        <div className="row-gap" style={{ gap: 8 }}>
          <button onClick={exportCSV} className="btn btn-secondary"><AI.download /> Экспорт CSV</button>
          <button onClick={() => setInviteOpen(true)} className="btn btn-primary"><AI.plus /> Пригласить</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="seg">
          <button onClick={() => setFilterRole('all')} className={filterRole === 'all' ? 'active' : ''}>Все</button>
          {roles.filter(r => r !== 'all').map(r => (
            <button key={r} onClick={() => setFilterRole(r)} className={filterRole === r ? 'active' : ''}>
              {ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="row-gap" style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', gap: 10, minWidth: 280 }}>
          <AI.search style={{ color: 'var(--ink-3)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по имени или email…"
            style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Статус</th>
              <th style={{ textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 56, textAlign: 'center', color: 'var(--ink-3)' }}>Загрузка…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 56, textAlign: 'center', color: 'var(--ink-3)' }}>
                {q ? `Ничего не найдено по запросу «${q}»` : 'Пользователей нет'}
              </td></tr>
            ) : rows.map((u: any, i: number) => {
              const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`;
              const isAdmin = u.role === 'super_admin' || u.role === 'admin';
              return (
                <tr key={u.id} className="fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <td>
                    <div className="row-gap" style={{ gap: 12 }}>
                      <div className="user-avatar" style={{ width: 38, height: 38, borderRadius: 8, fontSize: 12, background: isAdmin ? 'var(--red)' : 'var(--ink)', color: '#fff' }}>{initials || '?'}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{u.firstName} {u.lastName}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{u.id?.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{u.email}</td>
                  <td style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>{u.phone || '—'}</td>
                  <td>
                    <span className={`pill ${isAdmin ? 'pill-red' : ''}`}><span className="dot" />{ROLE_LABELS[u.role] || u.role}</span>
                  </td>
                  <td>
                    <span className={`pill ${u.isActive ? 'pill-ok' : ''}`}><span className="dot" />{u.isActive ? 'Активен' : 'Заблокирован'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setDetail(u)} className="btn btn-ghost btn-sm">Открыть <AI.arrR /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detail && <DetailModal user={detail} onClose={() => setDetail(null)} />}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSaved={() => { load(); pushToast('Пользователь создан', 'success'); }} />
    </div>
  );
}
