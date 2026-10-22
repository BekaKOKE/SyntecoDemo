'use client';

import { useState, useRef, useCallback } from 'react';
import { AI } from '@/lib/icons';
import { useToast } from '@/components/Toast';
import { getAccessToken } from '@/lib/api/client';

interface ImageUploadProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ imageUrl, onChange }: ImageUploadProps) {
  const { pushToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.match(/^image\/(jpeg|png|gif|webp|svg\+xml)$/)) {
      pushToast('Только изображения: JPEG, PNG, GIF, WebP, SVG', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      pushToast('Файл слишком большой (макс. 10 МБ)', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAccessToken();
      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type — browser auto-sets multipart boundary
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        // Try to parse error as JSON, fallback to status text
        const text = await res.text();
        let message = 'Ошибка загрузки';
        try {
          const err = JSON.parse(text);
          message = err.message || err.detail || err.title || message;
        } catch {
          // Non-JSON error responses keep the generic upload message.
        }
        throw new Error(message);
      }

      const data = JSON.parse(await res.text());
      onChange(data.url);
      pushToast('Изображение загружено', 'success');
    } catch (e: any) {
      console.error('[ImageUpload] Upload failed:', e);
      pushToast(e?.message || 'Ошибка загрузки', 'error');
    } finally {
      setUploading(false);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--ink-3)',
        display: 'block', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        Изображение
      </div>

      {/* Upload zone */}
      <button
        type="button"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--red)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--r-lg)',
          width: '100%',
          padding: 32,
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--red-light)' : 'var(--surface-2)',
          transition: 'all .15s ease',
          marginBottom: 16,
        }}
      >
        {uploading ? (
          <div>
            <div className="skeleton" style={{ width: 120, height: 16, margin: '0 auto' }} />
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Загрузка…</div>
          </div>
        ) : (
          <div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--info-light)', color: 'var(--info)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <AI.upload style={{ width: 20, height: 20 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
              Перетащите изображение или <span style={{ color: 'var(--red)' }}>выберите файл</span>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              JPEG, PNG, GIF, WebP, SVG · макс. 10 МБ
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          aria-label="Выбрать изображение"
          onChange={handleChange} style={{ display: 'none' }} />
      </button>

      {/* URL fallback */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="product-image-url" style={{
          fontSize: 11, fontWeight: 700, color: 'var(--ink-3)',
          display: 'block', marginBottom: 6,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Или вставьте URL
        </label>
        <input id="product-image-url" className="input" value={imageUrl} onChange={e => onChange(e.target.value)}
          placeholder="https://static.grainger.com/rp/s/is/image/..." />
      </div>

      {/* Preview */}
      {imageUrl && (
        <div className="card" style={{ overflow: 'hidden', aspectRatio: '1', maxWidth: 240, marginTop: 8 }}>
          <img src={imageUrl}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f5f4f1' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}
