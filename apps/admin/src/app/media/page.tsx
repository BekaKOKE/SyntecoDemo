'use client';

import { useState, useEffect } from 'react';
import { AI } from '@/lib/icons';
import { getProducts } from '@/lib/api/admin';

export default function MediaPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 100 }).then(r => {
      const imgs = (r.data || []).filter((p: any) => p.imageUrl).map((p: any) => ({
        id: p.id, url: p.imageUrl, title: p.title, variantId: p.variantId,
      }));
      setImages(imgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Медиафайлы</div>
          <div className="page-sub">{images.length} изображений загружено из каталога товаров</div>
        </div>
        <button className="btn btn-primary btn-sm"><AI.plus /> Загрузить</button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60 }}><div className="skeleton" style={{ height: 200 }} /></div>
      ) : images.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Нет загруженных изображений</h3>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Изображения появятся здесь после загрузки товаров с URL-адресами изображений.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {images.map(img => (
            <div key={img.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12, background: '#fff' }} loading="lazy" />
              </div>
              <div style={{ padding: 10, fontSize: 11, color: 'var(--ink-3)' }}>
                <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</div>
                <div className="mono muted" style={{ marginTop: 2 }}>{img.variantId}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
