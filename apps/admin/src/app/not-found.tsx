import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18, margin: '0 auto 24px',
          background: 'var(--red-light)', color: 'var(--red)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 800,
        }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--ink)' }}>
          Страница не найдена
        </h1>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 28 }}>
          Этой страницы не существует в панели управления.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/dashboard" className="btn btn-primary">На дашборд</Link>
          <Link href="/products" className="btn btn-secondary">К товарам</Link>
        </div>
      </div>
    </div>
  );
}
