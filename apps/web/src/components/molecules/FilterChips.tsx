'use client';

import type { ActiveFilters } from '@/components/molecules/FilterSidebar';
import type { FacetsResponse } from '@/lib/api/products';

interface FilterChipsProps {
  active: ActiveFilters;
  facets: FacetsResponse | null;
  onRemove: (filters: ActiveFilters) => void;
  onReset: () => void;
}

export function FilterChips({ active, facets, onRemove, onReset }: FilterChipsProps) {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (active.brandId) {
    const brand = facets?.brands.find(b => b.id === active.brandId);
    chips.push({
      label: brand?.name ?? active.brandId,
      onRemove: () => onRemove({ ...active, brandId: undefined }),
    });
  }

  if (active.minPrice !== undefined || active.maxPrice !== undefined) {
    const min = active.minPrice ? `${active.minPrice}₸` : '';
    const max = active.maxPrice ? `${active.maxPrice}₸` : '';
    chips.push({
      label: `${min}${min && max ? ' – ' : ''}${max}`,
      onRemove: () => onRemove({ ...active, minPrice: undefined, maxPrice: undefined }),
    });
  }

  Object.entries(active.attributes).forEach(([name, values]) => {
    const facet = facets?.attributes.find(item => item.name === name);
    const displayName = facet?.displayName ?? name;
    values?.forEach(v => {
      chips.push({
        label: `${displayName}: ${v}`,
        onRemove: () => {
          const next = { ...active.attributes };
          next[name] = next[name]!.filter(x => x !== v);
          if (next[name]!.length === 0) delete next[name];
          onRemove({ ...active, attributes: next });
        },
      });
    });
  });

  if (active.warehouseId) {
    const wh = facets?.warehouses.find(w => w.id === active.warehouseId);
    chips.push({
      label: wh?.name ?? active.warehouseId,
      onRemove: () => onRemove({ ...active, warehouseId: undefined }),
    });
  }

  if (active.inStockOnly) {
    chips.push({
      label: 'В наличии',
      onRemove: () => onRemove({ ...active, inStockOnly: false }),
    });
  }

  if (active.industry) {
    const industryLabels: Record<string, string> = {
      'O&G': 'Нефть и газ', 'CNS': 'Строительство', 'MFG': 'Производство',
      'ENG': 'Энергетика', 'MIN': 'Горная добыча', 'LOG': 'Логистика',
    };
    chips.push({
      label: industryLabels[active.industry] ?? active.industry,
      onRemove: () => onRemove({ ...active, industry: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }}>
      {chips.map((chip, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 999, fontSize: 12,
          background: 'var(--color-surface-2)', border: '1px solid var(--color-hair-strong)',
          color: 'var(--color-ink-2)',
        }}>
          {chip.label}
          <button onClick={chip.onRemove} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0, fontSize: 14, lineHeight: 1, color: 'var(--color-ink-4)',
          }}>×</button>
        </span>
      ))}
      <button onClick={onReset} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 12, color: 'var(--color-accent)', padding: 0,
      }}>
        Сбросить всё
      </button>
    </div>
  );
}
