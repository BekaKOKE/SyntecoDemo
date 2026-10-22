import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 80, fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Страница не найдена</h1>
        <p className="muted" style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 28 }}>
          Возможно, страница была перемещена, удалена, или вы набрали неправильный адрес.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary btn-lg">На главную</Link>
          <Link href="/products" className="btn btn-secondary btn-lg">В каталог</Link>
        </div>
      </div>
    </div>
  );
}
