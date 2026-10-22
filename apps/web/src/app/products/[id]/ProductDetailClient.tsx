'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Product } from '@/lib/api/products';
import { useCart } from '@/lib/context/cart-context';
import { Icons } from '@/lib/icons';
import { QuoteModal } from '@/components/molecules/QuoteModal';
import { formatPrice } from '@/lib/format';

/** Strip HTML tags, SVG garbage, and scraped Grainger artifacts from descriptions */
function stripHtml(html: string): string {
  if (!html) return '';
  let cleaned = html
    // Remove all well-formed HTML/SVG/XML tags
    .replace(/<[^>]*>/g, '')
    // Remove unclosed <path / <svg tags (broken scraped HTML — no closing >)
    .replace(/<path\b[^<]*/gi, '')
    .replace(/<svg\b[^<]*/gi, '')
    // Remove HTML entities
    .replace(/&[a-z]+;/gi, '')
    .replace(/&#x?[0-9a-f]+;/gi, '')
    // Remove leftover XML/SVG attributes without tags
    .replace(/\b(viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|xmlns|d)="[^"]*"/gi, '')
    // Remove dangling self-closing tag endings
    .replace(/\/>/g, '')
    // Collapse whitespace
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  // Truncate very long descriptions
  if (cleaned.length > 800) {
    const cut = cleaned.lastIndexOf('.', 800);
    return cut > 400 ? cleaned.slice(0, cut + 1) : cleaned.slice(0, 800) + '…';
  }
  return cleaned;
}

// ── Main PDP (interactive client shell — product comes from the server) ──

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [tab, setTab] = useState('specs');
  const [qty, setQty] = useState(1);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const stockTotal = product.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
  const inStock = product.availability === 'in_stock' && stockTotal > 0;
  const attrs = product.attributes && typeof product.attributes === 'object'
    ? Object.entries(product.attributes as Record<string, string>)
    : [];
  const cat = product.categories?.[0]?.category;
  const basePrice = Number(product.price) || 0;
  const unitPrice = Number(product.salePrice ?? product.price) || 0;

  const tabs = [
    { id: 'specs', name: 'Спецификации' },
    { id: 'stock', name: 'Наличие' },
    { id: 'docs', name: 'Документы' },
    { id: 'alts', name: 'Аналоги' },
  ];

  return (
    <main style={{ background: 'var(--color-bg)', paddingTop: 20, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="container-site">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 16, flexWrap: 'wrap' }}>
          <Link href="/">Главная</Link><span style={{ color: 'var(--color-ink-5)' }}>/</span>
          <Link href="/products">Каталог</Link>
          {cat && <><span style={{ color: 'var(--color-ink-5)' }}>/</span><Link href={`/categories/${cat.slug}`}>{cat.name}</Link></>}
          <span style={{ color: 'var(--color-ink-5)' }}>/</span>
          <span style={{ color: 'var(--color-ink-2)' }}>{product.title.substring(0, 40)}...</span>
        </div>

        {/* 3-column layout */}
        <div className="layout-3col" style={{ alignItems: 'start' }}>
          {/* ── Gallery ── */}
          <div className="pdp-gallery" style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 130 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="ph" style={{ aspectRatio: '1', borderRadius: 0 }}>
                {product.imageUrl ? (
	                  <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, position: 'relative', zIndex: 1 }} />
                ) : (
                  <>
                    <span className="ph-label mono">{product.variantId} · main view</span>
                    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1, display: 'flex', gap: 6 }}>
                      <span className="pill solid mono" style={{ fontSize: 10 }}>{product.brand?.name}</span>
                      <span className="pill" style={{ fontSize: 10 }}>{product.mpn ?? 'MRO'}</span>
                    </div>
                  </>
                )}
                <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1, display: 'flex', gap: 8 }}>
                  {product.documents && product.documents.length > 0 && (
                    <span className="pill" style={{ fontSize: 10 }}>3D / STEP</span>
                  )}
                </div>
              </div>
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.images.slice(0, 6).map((img, i) => (
                  <div key={img.id} className="ph" style={{ width: 'clamp(56px, 12vw, 84px)', aspectRatio: '1', border: i === 0 ? '2px solid var(--color-accent)' : '1px solid var(--color-hair)', borderRadius: 8 }}>
                    <img src={img.thumbUrl || img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4, position: 'relative', zIndex: 1 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 500 }}>{product.brand?.name}</span>
              <span style={{ color: 'var(--color-ink-5)' }}>·</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>SKU {product.variantId}{product.mpn && ` · MPN ${product.mpn}`}</span>
            </div>
            <h1 className="pdp-title" style={{ marginTop: 10, letterSpacing: '-0.025em', fontWeight: 600 }}>{product.title}</h1>

            <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {inStock ? (
                <span className="pill ok"><span className="dot" />В наличии</span>
              ) : (
                <span className="pill warn"><span className="dot" />Нет в наличии</span>
              )}
              {inStock && <span className="pill"><Icons.truck /> В наличии на складе</span>}
            </div>

            {/* Tabs */}
            <div className="hairt hairb" style={{ marginTop: 32, display: 'flex', gap: 2, overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    background: 'transparent', border: 0, padding: '16px 14px',
                    fontSize: 13, fontWeight: tab === t.id ? 600 : 500,
                    color: tab === t.id ? 'var(--color-ink)' : 'var(--color-ink-3)',
                    borderBottom: tab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                    marginBottom: -1, cursor: 'pointer',
                  }}
                >{t.name}</button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ paddingTop: 24 }}>
              {tab === 'specs' && (
                <div>
                  {((product as any).descriptionRu || product.description) && (
                    <p style={{ fontSize: 14, color: 'var(--color-ink-2)', maxWidth: 720, lineHeight: 1.6, marginBottom: 18, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {stripHtml((product as any).descriptionRu || product.description || '')}
                    </p>
                  )}
                  {attrs.length > 0 && (
                    <div className="card table-wrap">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {attrs.map(([k, v], i) => (
                            <tr key={k} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--color-hair)' }}>
                              <td className="muted" style={{ padding: '10px 14px', fontSize: 12, wordBreak: 'break-word' }}>{k}</td>
                              <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink)', wordBreak: 'break-word' }}>{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'stock' && (
                <div className="card table-wrap" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-surface-2)' }}>
                        {['Филиал', 'Остаток, шт', 'Готовность к отгрузке', 'Доставка'].map(h => (
                          <th key={h} className="eyebrow" style={{ textAlign: 'left', padding: '12px 18px', color: 'var(--color-ink-3)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {product.stock?.map((s, i) => (
                        <tr key={s.warehouseId} style={{ borderTop: '1px solid var(--color-hair)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>
                            <div style={{ fontWeight: 500 }}>{s.warehouse.name}</div>
                            <div className="mono" style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>{s.warehouse.code}</div>
                          </td>
                          <td className="num mono" style={{ padding: '14px 18px', fontSize: 14, color: s.quantity - s.reserved === 0 ? 'var(--color-ink-4)' : 'var(--color-ink)' }}>
                            {(s.quantity - s.reserved).toLocaleString('ru-RU')}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>
                            {s.quantity - s.reserved === 0
                              ? <span className="pill"><span className="dot" />отсутствует</span>
                              : s.quantity - s.reserved < 50
                                ? <span className="pill warn"><span className="dot" />менее 50 шт</span>
                                : <span className="pill ok"><span className="dot" />готово к отгрузке</span>}
                          </td>
                          <td className="muted" style={{ padding: '14px 18px', fontSize: 13 }}>3–4 ч. курьером по городу</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {product.documents && product.documents.length > 0 ? product.documents.map(d => (
                    <div key={d.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-2)' }}>
                          <Icons.doc />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                          <div className="mono" style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 2 }}>{d.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <a href={d.url} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><Icons.chevR /> Скачать</a>
                    </div>
                  )) : (
                    <p className="muted">Документация уточняется. Запросите у менеджера.</p>
                  )}
                </div>
              )}

              {tab === 'alts' && (
                <p className="muted">Аналоги будут подобраны AI-системой после загрузки полного каталога.</p>
              )}
            </div>
          </div>

          {/* ── Sticky Buy Box ── */}
          <aside style={{ position: 'sticky', top: 130, alignSelf: 'start' }}>
            <div className="card" style={{ padding: 20, boxShadow: 'var(--shadow-2)' }}>
              {unitPrice > 0 ? (
                <>
                  <div className="eyebrow">Цена за шт. · без НДС</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <span className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{formatPrice(unitPrice)}</span>
                    {product.salePrice != null && basePrice > unitPrice && (
                      <span className="num muted" style={{ fontSize: 14, textDecoration: 'line-through' }}>{formatPrice(basePrice)}</span>
                    )}
                  </div>
                  {qty > 1 && (
                    <div className="num muted" style={{ fontSize: 13, marginTop: 4 }}>{qty} шт × {formatPrice(unitPrice)} = <b style={{ color: 'var(--color-ink)' }}>{formatPrice(unitPrice * qty)}</b></div>
                  )}
                  <p className="muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                    Оптовые скидки и промокоды применяются при оформлении. Для крупных партий запросите КП.
                  </p>
                </>
              ) : (
                <>
                  <div className="eyebrow">Цена по запросу</div>
                  <div style={{ marginTop: 8 }}>
                    <span className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>По запросу</span>
                  </div>
                  <p className="muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                    Отправьте запрос — менеджер пришлёт коммерческое предложение с актуальной ценой,
                    наличием и сроками поставки.
                  </p>
                </>
              )}

              {/* Qty + Add */}
              <div className="hairt" style={{ marginTop: 18, paddingTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Количество</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px minmax(42px, 1fr) 40px', height: 42, border: '1px solid var(--color-hair-strong)', borderRadius: 10, overflow: 'hidden', flex: '1 1 120px', minWidth: 120 }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Уменьшить количество" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 0, background: 'transparent', color: 'var(--color-ink-2)', cursor: 'pointer' }}><Icons.minus /></button>
                    <input value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="num" style={{ width: '100%', minWidth: 0, border: 0, borderLeft: '1px solid var(--color-hair)', borderRight: '1px solid var(--color-hair)', textAlign: 'center', background: 'transparent', fontSize: 16, fontWeight: 500, color: 'var(--color-ink)', outline: 'none' }} />
                    <button onClick={() => setQty(qty + 1)} aria-label="Увеличить количество" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 0, background: 'transparent', color: 'var(--color-ink-2)', cursor: 'pointer' }}><Icons.plus /></button>
                  </div>
                  <button onClick={() => setQty(10)} className="btn btn-ghost btn-sm" style={{ height: 42 }}>×10</button>
                  <button onClick={() => setQty(50)} className="btn btn-ghost btn-sm" style={{ height: 42 }}>×50</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
                <button onClick={() => setQuoteOpen(true)} className="btn btn-primary btn-lg btn-block">
                  Запросить КП на {qty} шт
                </button>
                <button onClick={() => addItem(product.id, qty)} disabled={!inStock} className="btn btn-secondary btn-block" style={{ opacity: inStock ? 1 : 0.4 }}>
                  <Icons.cart /> Добавить в заказ
                </button>
              </div>

              <div className="hairt" style={{ marginTop: 18, paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-ink-3)' }}><Icons.truck /> Доставка</div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>по Казахстану</div>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-ink-3)' }}><Icons.doc /> Гарантия</div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>365 дней · возврат</div>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-ink-3)' }}><Icons.check /> Сертификаты</div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>по запросу</div>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-ink-3)' }}><Icons.user /> Менеджер</div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>свяжется с вами</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={{ variantId: product.variantId, title: product.title }}
        qty={qty}
        unitPrice={unitPrice}
      />
    </main>
  );
}
