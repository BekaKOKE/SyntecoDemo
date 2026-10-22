'use client';

import { useMemo, useState } from 'react';
import type { BrandCatalogSubcategory, BrandProduct } from '@/config/brands/types';

const PAGE_SIZE = 24;

type SortKey = 'default' | 'name' | 'sku' | 'brand';
type View = 'grid' | 'list';

const IconSearch = () => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <circle cx="9" cy="9" r="6" />
    <path d="m14 14 4 4" strokeLinecap="round" />
  </svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="11" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="11" width="6" height="6" rx="1" />
    <rect x="11" y="11" width="6" height="6" rx="1" />
  </svg>
);
const IconList = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="3" y="4" width="14" height="3" rx="1" />
    <rect x="3" y="9" width="14" height="3" rx="1" />
    <rect x="3" y="14" width="14" height="3" rx="1" />
  </svg>
);
const IconExternal = () => (
  <svg viewBox="0 0 20 20" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M15 11v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4M12 3h5v5M17 3l-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

import { BrandProductCard } from './BrandProductCard';

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/**
 * Product grid for a whole manufacturer category.
 *
 * Every product of every subcategory is shown at once — the subcategories
 * become filter chips rather than a separate drill-down step, so landing on
 * the brand page puts real products on screen immediately.
 */
export function BrandProductGrid({
  subcategories,
  brandColor,
  brandName,
  categoryName,
}: {
  subcategories: BrandCatalogSubcategory[];
  brandColor: string;
  brandName: string;
  categoryName: string;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [view, setView] = useState<View>('grid');
  const [group, setGroup] = useState<string>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);

  /** Subcategories that actually carry products, in catalog order. */
  const groups = useMemo(
    () => subcategories.filter((s) => s.products?.length),
    [subcategories],
  );

  /**
   * Flat product list, tagged with the subcategory it came from.
   *
   * De-duplicated by `pid`: the manufacturer cross-lists some products under
   * more than one subcategory (spare parts especially), and showing the same
   * card twice in the same grid reads as a bug. The first subcategory in
   * catalog order wins; the per-chip counts stay as the manufacturer has them.
   */
  const all = useMemo(() => {
    const seen = new Set<string>();
    const list: { p: BrandProduct; group: string }[] = [];
    for (const s of groups) {
      for (const p of s.products ?? []) {
        if (seen.has(p.pid)) continue;
        seen.add(p.pid);
        list.push({ p, group: s.name });
      }
    }
    return list;
  }, [groups]);

  /** Products for the current chip: the whole (de-duplicated) category, or
   *  one subcategory exactly as the manufacturer lists it. */
  const scoped = useMemo(() => {
    if (group === 'all') return all;
    const sub = groups.find((s) => s.name === group);
    return (sub?.products ?? []).map((p) => ({ p, group }));
  }, [all, groups, group]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = scoped;
    if (q) {
      list = list.filter(({ p }) =>
        `${p.brand} ${p.name} ${p.sku} ${p.descriptionRu} ${(p.tags ?? []).join(' ')}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort === 'name') list = [...list].sort((a, b) => a.p.name.localeCompare(b.p.name));
    else if (sort === 'sku') list = [...list].sort((a, b) => a.p.sku.localeCompare(b.p.sku));
    else if (sort === 'brand') list = [...list].sort((a, b) => a.p.brand.localeCompare(b.p.brand));
    return list;
  }, [scoped, query, sort]);

  const shown = filtered.slice(0, limit);
  const reset = () => setLimit(PAGE_SIZE);

  const activeSub = groups.find((s) => s.name === group);
  const sourceUrl = activeSub?.url ?? groups[0]?.url;

  return (
    <div className="pgrid-wrap" style={{ '--brand-accent': brandColor } as React.CSSProperties}>
      {/* ── filter chips: subcategories of this category ── */}
      {groups.length > 1 ? (
        <div className="pgrid-chips">
          <button
            type="button"
            className={`pgrid-chip${group === 'all' ? ' is-active' : ''}`}
            onClick={() => {
              setGroup('all');
              reset();
            }}
          >
            Все <span>{all.length}</span>
          </button>
          {groups.map((s) => (
            <button
              key={s.name}
              type="button"
              className={`pgrid-chip${group === s.name ? ' is-active' : ''}`}
              onClick={() => {
                setGroup(s.name);
                reset();
              }}
            >
              {s.name} <span>{s.products!.length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* ── toolbar ── */}
      <div className="pgrid-toolbar">
        <label className="pgrid-search">
          <IconSearch />
          <input
            type="search"
            value={query}
            placeholder={`Поиск в ${categoryName} — название, артикул, применение…`}
            onChange={(e) => {
              setQuery(e.target.value);
              reset();
            }}
          />
        </label>

        <div className="pgrid-toolbar-right">
          <span className="pgrid-count">
            <strong>{filtered.length}</strong>{' '}
            {plural(filtered.length, 'товар', 'товара', 'товаров')}
            {filtered.length !== scoped.length ? ` из ${scoped.length}` : ''}
          </span>
          <select
            className="pgrid-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Сортировка"
          >
            <option value="default">По каталогу</option>
            <option value="name">По названию</option>
            <option value="sku">По артикулу</option>
            <option value="brand">По линейке</option>
          </select>
          <div className="pgrid-views">
            <button
              type="button"
              className={view === 'grid' ? 'is-active' : ''}
              onClick={() => setView('grid')}
              aria-label="Плитками"
              title="Плитками"
            >
              <IconGrid />
            </button>
            <button
              type="button"
              className={view === 'list' ? 'is-active' : ''}
              onClick={() => setView('list')}
              aria-label="Списком"
              title="Списком"
            >
              <IconList />
            </button>
          </div>
        </div>
      </div>

      {/* ── grid ── */}
      {shown.length === 0 ? (
        <div className="pgrid-empty">
          <IconSearch />
          <p>
            Ничего не найдено.
            <br />
            Попробуйте другой запрос или снимите фильтр.
          </p>
        </div>
      ) : (
        <div className={`pgrid${view === 'list' ? ' is-list' : ''}`}>
          {shown.map(({ p }, i) => (
            <BrandProductCard
              key={p.pid}
              product={p}
              brandColor={brandColor}
              brandName={brandName}
              priority={i < 8}
            />
          ))}
        </div>
      )}

      {/* ── footer ── */}
      <div className="pgrid-foot">
        {limit < filtered.length ? (
          <button type="button" className="pgrid-more" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
            Показать ещё {Math.min(PAGE_SIZE, filtered.length - limit)}
            <span> · осталось {filtered.length - limit}</span>
          </button>
        ) : null}
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="pgrid-src">
            Открыть эту категорию в каталоге {brandName} <IconExternal />
          </a>
        ) : null}
      </div>
    </div>
  );
}
