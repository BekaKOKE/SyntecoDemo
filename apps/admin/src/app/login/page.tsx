'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { defaultAdminPath } from '@/lib/roles';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(defaultAdminPath(user?.role));
    }
  }, [isAuthenticated, router, user?.role]);

  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(email, password);
      router.push(defaultAdminPath(profile.role));
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div className="card" style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--red)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px -6px var(--red)',
            marginBottom: 16,
          }}>
            <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
              <path d="M9 10 L22 10 L22 14 L13 14 L13 15 L22 15 L22 22 L9 22 L9 18 L18 18 L18 17 L9 17 Z" fill="currentColor" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Synteco Admin</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Панель управления</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="admin-email" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input
              id="admin-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="admin-password" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Пароль</label>
            <input
              id="admin-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--r-md)',
              background: 'var(--red-light)', color: 'var(--red)',
              fontSize: 12, fontWeight: 600, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Вход…' : 'Войти в панель управления'}
          </button>
        </form>

        <div className="hairt" style={{ marginTop: 24, paddingTop: 16, textAlign: 'center' }}>
          <a href="http://localhost:3001" className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
            ← Вернуться в магазин
          </a>
        </div>
      </div>
    </div>
  );
}
