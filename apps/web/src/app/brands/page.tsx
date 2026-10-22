'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { StaticPage } from '@/components/layouts/StaticPage';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/lib/icons';
import { getOfficialBrands } from '@/config/brands';

interface Brand {
  name: string;
  count: number;
}

export default function BrandsPage() {
  const officialBrands = getOfficialBrands();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string>('all');

  useEffect(() => {
    fetch('/api/v1/brands')
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const filtered = brands.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (group !== 'all') {
      const first = b.name[0]!.toUpperCase();
      if (group === 'a-e' && !'ABCDE'.includes(first)) return false;
      if (group === 'f-j' && !'FGHIJ'.includes(first)) return false;
      if (group === 'k-o' && !'KLMNO'.includes(first)) return false;
      if (group === 'p-t' && !'PQRST'.includes(first)) return false;
      if (group === 'u-z' && !'UVWXYZ'.includes(first)) return false;
      if (group === '0-9' && /[A-Z]/.test(first)) return false;
    }
    return true;
  });

  const groups = [
    { id: 'all', label: 'Все' },
    { id: 'a-e', label: 'A–E' },
    { id: 'f-j', label: 'F–J' },
    { id: 'k-o', label: 'K–O' },
    { id: 'p-t', label: 'P–T' },
    { id: 'u-z', label: 'U–Z' },
    { id: '0-9', label: '0–9' },
  ];

  return (
    <StaticPage title="Бренды" subtitle="Официальные дистрибьюторы и бренды каталога" compact>
      {/* Official distributors — top section */}
      <section className="brand-page-official industrial-section" style={{ marginLeft: -24, marginRight: -24, padding: '34px 24px' }}>
        <div className="industrial-shell">
          <div className="industrial-intro">
            <div>
              <div className="eyebrow industrial-eyebrow">Официальные дистрибьюторы</div>
              <h2 style={{ marginTop: 10, fontSize: 28 }}>Бренды, которые мы представляем официально</h2>
              <p className="industrial-copy">
                Synteco работает с промышленными брендами для СИЗ, пожарной безопасности, LOTO и спецоборудования.
                Здесь собраны производители, по которым можно быстро перейти в каталог или запросить КП.
              </p>
              <div className="industrial-proof-grid">
                <div className="industrial-proof">
                  <strong>{officialBrands.length}</strong>
                  <span>официальных направлений</span>
                </div>
                <div className="industrial-proof">
                  <strong>SKU</strong>
                  <span>поиск по бренду</span>
                </div>
              </div>
            </div>
          </div>

          <div className="official-brand-grid">
            {officialBrands.map(b => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="official-brand-card"
                style={{ '--brand-accent': b.heroColor } as CSSProperties}
              >
                <div className="official-brand-logo">
                  <span className="official-brand-badge">Official</span>
                  <Image
                    src={b.logoUrl}
                    alt={b.name}
                    width={180}
                    height={86}
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                <div className="official-brand-body">
                  <div className="official-brand-name">{b.name}</div>
                  <div className="official-brand-meta">{b.country} · с {b.established} г.</div>
                  <div className="official-brand-tagline">{b.taglineRu}</div>
                  <div className="official-brand-tags">
                    {b.industries.slice(0, 3).map(item => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <div className="official-brand-footer">
                    <span>Открыть страницу</span>
                    <Icons.arrow />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div style={{ display: 'none' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Официальные дистрибьюторы</div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Бренды, которые мы представляем официально</h2>
        <p className="muted" style={{ marginBottom: 20, fontSize: 14 }}>
          Авторизованный поставщик мировых производителей СИЗ, пожарной безопасности и спецоборудования.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {officialBrands.map(b => (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="card card-lift"
              style={{
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                textAlign: 'center',
              }}
            >
              <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  src={b.logoUrl}
                  alt={b.name}
                  width={120}
                  height={44}
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                  {b.country} · с {b.established} г.
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All brands in catalog */}
      <div className="eyebrow" style={{ marginBottom: 8 }}>Все бренды в каталоге</div>
      <div className="brand-directory-toolbar">
        <div className="brand-directory-search">
          <Icons.search width={16} height={16} />
          <input
            placeholder="Найти бренд…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14, height: 36, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
          />
        </div>
        <div className="brand-directory-tabs">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={group === g.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ borderRadius: 999, fontSize: 12 }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, color: 'var(--color-ink-4)' }}><Icons.factory width={40} height={40} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Бренды не найдены</h3>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Попробуйте изменить поисковый запрос.</p>
        </div>
      ) : (
        <div className="brand-directory-grid">
          {filtered.map(b => (
            <Link key={b.name} href={`/products?search=${encodeURIComponent(b.name)}`} className="brand-directory-card">
              <div>
                <div className="brand-directory-card-title">{b.name}</div>
                <div className="brand-directory-card-count">{b.count} SKU</div>
              </div>
              <span style={{ color: 'var(--color-ink-4)', display: 'flex', alignItems: 'center' }}><Icons.chevR width={16} height={16} /></span>
            </Link>
          ))}
        </div>
      )}
    </StaticPage>
  );
}
