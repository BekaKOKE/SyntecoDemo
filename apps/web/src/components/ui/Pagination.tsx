'use client';

/**
 * Reusable, accessible pagination (F-06).
 * Shows first/prev, a windowed range of pages with ellipses, and next/last —
 * so users can reach the end of the catalog, not just the first 7 pages.
 */

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Build a compact page list with 1, …, window, …, last. */
function buildPages(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('…');
  pages.push(total);

  return pages;
}

const btnStyle: React.CSSProperties = { minWidth: 36, height: 36, padding: '0 10px' };

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const go = (p: number) => onChange(Math.min(Math.max(1, p), totalPages));

  return (
    <nav
      aria-label="Постраничная навигация"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 28, flexWrap: 'wrap' }}
    >
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Предыдущая страница"
        className="btn btn-ghost btn-sm"
        style={{ ...btnStyle, opacity: page === 1 ? 0.4 : 1 }}
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} aria-hidden="true" style={{ padding: '0 4px', color: 'var(--color-ink-4)' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-label={`Страница ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={btnStyle}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Следующая страница"
        className="btn btn-ghost btn-sm"
        style={{ ...btnStyle, opacity: page === totalPages ? 0.4 : 1 }}
      >
        ›
      </button>
    </nav>
  );
}
