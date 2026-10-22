'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Only same-origin paths — never an open redirect
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/');
    } catch (err: any) {
      setError(err.message ?? 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-site" style={{ maxWidth: 420, margin: '64px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1>Вход</h1>
        <p className="muted" style={{ marginTop: 8 }}>Войдите в корпоративный аккаунт Synteco</p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--color-warn-soft)', color: 'var(--color-warn)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'var(--font-sans)', background: 'var(--color-surface)' }}
            placeholder="email@company.kz" />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'var(--font-sans)', background: 'var(--color-surface)' }}
            placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <p className="muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        Нет аккаунта? <Link href="/register" style={{ color: 'var(--color-accent)' }}>Регистрация</Link>
      </p>
    </div>
  );
}
