'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { PhoneInput } from '@/components/molecules/PhoneInput';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  // Согласие по закону РК № 94-V даётся активным действием и НЕ проставляется заранее.
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password, form.phone || undefined, consent, marketingConsent);
      router.push('/');
    } catch (err: any) {
      setError(err.message ?? 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-site" style={{ maxWidth: 480, margin: '64px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1>Регистрация</h1>
        <p className="muted" style={{ marginTop: 8 }}>Создайте корпоративный аккаунт для доступа к оптовым ценам</p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--color-warn-soft)', color: 'var(--color-warn)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="grid-2" style={{ gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Имя</label>
            <input value={form.firstName} onChange={update('firstName')} required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Фамилия</label>
            <input value={form.lastName} onChange={update('lastName')} required style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Email</label>
          <input type="email" value={form.email} onChange={update('email')} required style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Телефон</label>
          <PhoneInput value={form.phone} onChange={v => setForm({ ...form, phone: v })} style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Пароль</label>
          <input type="password" value={form.password} onChange={update('password')} required minLength={8} style={inputStyle} />
        </div>


        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.5, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              style={{ marginTop: 2, width: 16, height: 16, flex: 'none', cursor: 'pointer' }}
            />
            <span>
              Я даю согласие на обработку моих персональных данных в соответствии с{' '}
              <Link href="/privacy" style={{ textDecoration: 'underline' }}>Политикой конфиденциальности</Link>
              {' '}и принимаю{' '}
              <Link href="/terms" style={{ textDecoration: 'underline' }}>Условия использования</Link>.
            </span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.5, cursor: 'pointer', opacity: 0.85 }}>
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, flex: 'none', cursor: 'pointer' }}
            />
            <span>Согласен получать информацию о новых поступлениях и специальных предложениях. Необязательно, можно отписаться в любой момент.</span>
          </label>
        </div>
        <button type="submit" disabled={loading || !consent} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        Уже есть аккаунт? <Link href="/login" style={{ color: 'var(--color-accent)' }}>Войти</Link>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--color-hair-strong)',
  borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'var(--font-sans)',
  background: 'var(--color-surface)',
};
