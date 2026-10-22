'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/lib/icons';
import { apiFetch } from '@/lib/api/client';

interface Suggestion {
  variantId: string;
  title: string;
  brandName?: string;
}

export function SearchBar({ onSelect }: { onSelect?: () => void } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchSuggestions = useCallback(async (query: string) => {
    const requestId = ++requestIdRef.current;
    if (query.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    try {
      const data = await apiFetch<{ data: Suggestion[] }>(`/search/autocomplete?q=${encodeURIComponent(query)}`);
      if (requestId !== requestIdRef.current) return;
      setSuggestions(data.data ?? []);
      setOpen((data.data ?? []).length > 0);
    } catch {
      if (requestId === requestIdRef.current) setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (pathname !== '/search') {
      requestIdRef.current += 1;
      setQ('');
      setSuggestions([]);
      setOpen(false);
      setIdx(-1);
    }
  }, [pathname]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, fetchSuggestions]);

  const submit = (query?: string) => {
    const term = query ?? q;
    if (!term.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    onSelect?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(idx >= 0 ? suggestions[idx]?.title : undefined); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', background: 'var(--color-surface-2)',
        border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', transition: 'border-color 0.15s',
      }}>
        <span style={{ paddingLeft: 14, color: 'var(--color-ink-4)', display: 'flex' }}>
          <Icons.search />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); setIdx(-1); }}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={onKeyDown}
          placeholder="Поиск по товарам, брендам, категориям..."
          style={{
            flex: 1, padding: '10px 14px', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 14, color: 'var(--color-ink)',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button onClick={() => submit()} className="btn btn-primary" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: '10px 20px', height: 'auto', alignSelf: 'stretch' }}>
          Найти
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-2)', border: '1px solid var(--color-hair)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {suggestions.slice(0, 8).map((s, i) => (
            <div
              key={s.variantId}
              onMouseDown={() => { setQ(s.title); submit(s.title); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                background: i === idx ? 'var(--color-surface-2)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--color-hair)' : 'none',
              }}
            >
              <div style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{s.title}</div>
              {s.brandName && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{s.brandName} · {s.variantId}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
