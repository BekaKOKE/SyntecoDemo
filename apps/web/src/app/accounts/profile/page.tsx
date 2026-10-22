'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import Link from 'next/link';
import { Icons } from '@/lib/icons';

export default function AccountProfile() {
  const { user, isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated) {
    return <div className="container-site" style={{ padding: '80px 24px', textAlign: 'center' }}><div style={{ color: 'var(--color-ink-4)' }}><Icons.lock width={40} height={40} /></div><h1>Требуется авторизация</h1><Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Войти</Link></div>;
  }

  return (
    <div className="container-site" style={{ padding: '40px 24px' }}>
      <Link href="/accounts/dashboard" className="muted" style={{ fontSize: 12 }}>← Личный кабинет</Link>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 8, marginBottom: 24 }}>Профиль</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <form
          onSubmit={e => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); }}
          className="card" style={{ padding: 28 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Личные данные</h2>
          {saved && <div className="pill ok" style={{ marginBottom: 16, display: 'inline-flex' }}><Icons.check width={12} height={12} /> Данные сохранены</div>}
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Имя</label>
              <input className="input" defaultValue={user?.firstName || ''} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Фамилия</label>
              <input className="input" defaultValue={user?.lastName || ''} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Email</label>
              <input className="input" defaultValue={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Телефон</label>
              <input className="input" defaultValue={user?.phone || ''} placeholder="+7 (___) ___ __ __" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-ink-3)', display: 'block', marginBottom: 6 }}>Новый пароль</label>
              <input type="password" className="input" placeholder="Оставьте пустым, чтобы не менять" />
            </div>
            <button type="submit" className="btn btn-primary">Сохранить изменения</button>
          </div>
        </form>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Информация о компании</h2>
          {(user as any)?.company ? (
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              <div><span className="muted">Название:</span> <strong>{(user as any).company.name}</strong></div>
              <div style={{ marginTop: 8 }}><span className="muted">БИН:</span> <strong>{(user as any).company.bin || '—'}</strong></div>
              <div style={{ marginTop: 8 }}><span className="muted">Сегмент:</span> <span className="pill" style={{ fontSize: 10 }}>{(user as any).company.segment || 'small_business'}</span></div>
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 14 }}>Компания не привязана к аккаунту. Для B2B-доступа свяжитесь с менеджером.</p>
          )}
        </div>
      </div>
    </div>
  );
}
