'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Route-level error boundary for the storefront.
 * Replaces the blank white screen when a segment throws during render/data-fetch.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to Sentry once configured (OPS-02).
    console.error('Route error:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 16 }}>!</div>
        <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Что-то пошло не так</h1>
        <p className="muted" style={{ fontSize: 15, lineHeight: 1.55, marginBottom: 28 }}>
          Произошла ошибка при загрузке страницы. Попробуйте обновить — если проблема
          повторяется, свяжитесь с нами.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => reset()} className="btn btn-primary btn-lg">Попробовать снова</button>
          <Link href="/" className="btn btn-secondary btn-lg">На главную</Link>
        </div>
      </div>
    </div>
  );
}
