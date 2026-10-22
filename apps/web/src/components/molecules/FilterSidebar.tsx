'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import type { FacetsResponse, AttributeFacet } from '@/lib/api/products';

export interface ActiveFilters {
  minPrice?: number;
  maxPrice?: number;
  brandId?: string;
  attributes: Record<string, string[]>;
  warehouseId?: string;
  inStockOnly: boolean;
  industry?: string;
}

interface FilterSidebarProps {
  facets: FacetsResponse | null;
  active: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  onReset: () => void;
  /** Hide specific sections */
  compact?: boolean;
  hideBrand?: boolean;
  hideIndustry?: boolean;
}

export function FilterSidebar({ facets, active, onChange, onReset, compact, hideBrand, hideIndustry }: FilterSidebarProps) {
  const attributeFacets = facets?.attributes ?? [];
  const primaryAttributeFacets = attributeFacets.filter(facet => facet.priority !== false);
  const additionalAttributeFacets = attributeFacets.filter(facet => facet.priority === false);
  const hasActiveFilters =
    active.brandId !== undefined ||
    active.minPrice !== undefined ||
    active.maxPrice !== undefined ||
    Object.keys(active.attributes).some(k => (active.attributes[k]?.length ?? 0) > 0) ||
    active.warehouseId !== undefined ||
    active.inStockOnly ||
    active.industry !== undefined;

  const toggleAttribute = (facetName: string, value: string) => {
    const current = active.attributes[facetName] ?? [];
    const nextAttributes = { ...active.attributes };
    if (current.includes(value)) {
      nextAttributes[facetName] = current.filter(v => v !== value);
      if (nextAttributes[facetName]!.length === 0) delete nextAttributes[facetName];
    } else {
      nextAttributes[facetName] = [...current, value];
    }
    onChange({ ...active, attributes: nextAttributes });
  };

  return (
    <div className="filter-sidebar">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--color-ink-3)',
          }}
        >
          Фильтры
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              background: 'transparent',
              border: 0,
              fontSize: 12,
              color: 'var(--color-accent)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Сбросить
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '0 16px' }}>
        {/* Brand facet — with search */}
        {!hideBrand && facets && facets.brands && facets.brands.length > 1 && (
          <BrandBlock
            brands={facets.brands}
            activeBrandId={active.brandId}
            onToggle={(id) => onChange({ ...active, brandId: active.brandId === id ? undefined : id })}
          />
        )}

        {/* Industry filter */}
        {!hideIndustry && (
          <div className="hairb" style={{ padding: '16px 0' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Отрасль</div>
            <select
              value={active.industry ?? ''}
              onChange={(e) => onChange({ ...active, industry: e.target.value || undefined })}
              style={{
                width: '100%',
                height: 32,
                padding: '0 8px',
                border: '1px solid var(--color-hair-strong)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                background: 'var(--color-surface)',
                outline: 'none',
              }}
            >
              <option value="">Все отрасли</option>
              <option value="O&G">Нефть и газ</option>
              <option value="CNS">Строительство</option>
              <option value="MFG">Производство</option>
              <option value="ENG">Энергетика</option>
              <option value="MIN">Горная добыча</option>
              <option value="LOG">Логистика</option>
            </select>
          </div>
        )}

        {/* Attribute facets — hidden in compact mode */}
        {!compact && primaryAttributeFacets.map((facet: AttributeFacet) => (
          <FacetBlock
            key={facet.name}
            name={facet.displayName ?? facet.name}
            values={facet.values}
            activeValues={active.attributes[facet.name] ?? []}
            onToggle={(v) => toggleAttribute(facet.name, v)}
          />
        ))}

        {!compact && additionalAttributeFacets.length > 0 && (
          <AdditionalFacetGroup
            facets={additionalAttributeFacets}
            activeAttributes={active.attributes}
            onToggle={toggleAttribute}
          />
        )}

        {/* Warehouse facet — hidden in compact */}
        {!compact && facets && facets.warehouses.length > 0 && (
          <FacetBlock
            name="Склад"
            values={facets.warehouses.map((w) => ({ value: w.id, label: w.name, count: w.count }))}
            activeValues={active.warehouseId ? [active.warehouseId] : []}
            onToggle={(v) =>
              onChange({
                ...active,
                warehouseId: active.warehouseId === v ? undefined : v,
              })
            }
          />
        )}

        {/* In-stock toggle */}
        <div style={{ padding: '16px 0' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: active.inStockOnly ? 'var(--color-accent)' : 'var(--color-surface-3)',
                position: 'relative',
                transition: 'background .15s',
                flexShrink: 0,
              }}
              onClick={() => onChange({ ...active, inStockOnly: !active.inStockOnly })}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: active.inStockOnly ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: '#fff',
                  transition: 'left .15s',
                }}
              />
            </span>
            <span onClick={() => onChange({ ...active, inStockOnly: !active.inStockOnly })}>
              Только в наличии
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}


function FacetBlock({
  name,
  values,
  activeValues,
  onToggle,
}: {
  name: string;
  values: Array<{ value: string; label?: string; count: number }>;
  activeValues: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="hairb" style={{ padding: '16px 0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          border: 0,
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{name}</span>
        <Icons.chevD
          style={{
            color: 'var(--color-ink-4)',
            transform: open ? 'rotate(0)' : 'rotate(-90deg)',
            transition: 'transform .15s ease',
          }}
        />
      </button>
      {open && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {values.map((o) => {
            const isActive = activeValues.includes(o.value);
            return (
            <label
              key={o.value}
              onClick={() => onToggle(o.value)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-hair-strong)',
                    background:
                      isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  {isActive && <Icons.check />}
                </span>
                <span
                  style={{
                    color: isActive ? 'var(--color-ink)' : 'var(--color-ink-2)',
                  }}
                >
                  {o.label ?? o.value}
                </span>
              </span>
              {o.count > 0 && (
                <span
                  className="mono num"
                  style={{ fontSize: 11, color: 'var(--color-ink-4)' }}
                >
                  {o.count.toLocaleString('ru-RU')}
                </span>
              )}
            </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdditionalFacetGroup({
  facets,
  activeAttributes,
  onToggle,
}: {
  facets: AttributeFacet[];
  activeAttributes: Record<string, string[]>;
  onToggle: (facetName: string, value: string) => void;
}) {
  const hasActiveAdditional = facets.some(facet => (activeAttributes[facet.name]?.length ?? 0) > 0);
  const [open, setOpen] = useState(hasActiveAdditional);

  return (
    <div className="hairb" style={{ padding: '16px 0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          border: 0,
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
            Дополнительные фильтры
          </span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 400 }}>
            Технические атрибуты и уточнения
          </span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span className="mono num" style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>
            {facets.length}
          </span>
          <Icons.chevD
            style={{
              color: 'var(--color-ink-4)',
              transform: open ? 'rotate(0)' : 'rotate(-90deg)',
              transition: 'transform .15s ease',
            }}
          />
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 4 }}>
          {facets.map((facet) => (
            <FacetBlock
              key={facet.name}
              name={facet.displayName ?? facet.name}
              values={facet.values}
              activeValues={activeAttributes[facet.name] ?? []}
              onToggle={(value) => onToggle(facet.name, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandBlock({
  brands,
  activeBrandId,
  onToggle,
}: {
  brands: Array<{ id: string; name: string; count: number }>;
  activeBrandId?: string;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);
  const filtered = query
    ? brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
    : brands;

  return (
    <div className="hairb" style={{ padding: '16px 0' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Бренд</span>
        <Icons.chevD style={{ color: 'var(--color-ink-4)', transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform .15s ease' }} />
      </button>
      {open && (
        <>
          <input placeholder="Найти бренд..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%', marginTop: 10, height: 32, padding: '0 8px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none' }} />
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', maxHeight: 200, overflowY: 'auto' }}>
            {filtered.map(b => (
              <label key={b.id} onClick={() => onToggle(b.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13, cursor: 'pointer' }}>
                <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 16, height: 16, borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-hair-strong)', background: activeBrandId === b.id ? 'var(--color-accent)' : 'var(--color-surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {activeBrandId === b.id && <Icons.check />}
                  </span>
                  <span style={{ color: activeBrandId === b.id ? 'var(--color-ink)' : 'var(--color-ink-2)' }}>{b.name}</span>
                </span>
                <span className="mono num" style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>{b.count.toLocaleString('ru-RU')}</span>
              </label>
            ))}
            {filtered.length === 0 && <span className="muted" style={{ fontSize: 12, padding: '6px 0' }}>Ничего не найдено</span>}
          </div>
        </>
      )}
    </div>
  );
}
