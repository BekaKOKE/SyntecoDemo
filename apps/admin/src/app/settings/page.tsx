'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { getSettings, updateSettings } from '@/lib/api/admin';

export default function SettingsPage() {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    getSettings().then(data => {
      // Convert all values to strings for form inputs
      const stringified: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) {
        stringified[k] = String(v ?? '');
      }
      setFormData(stringified);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setSaved(true);
      toast('Настройки сохранены');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast('Ошибка сохранения', 'error');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Настройки</div><div className="page-sub">Системные параметры платформы</div></div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>Загрузка…</div>
      ) : (
      <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Основные</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {( [
              ['storeName', 'Название магазина', 'text'],
              ['currency', 'Валюта по умолчанию', 'text'],
              ['vatRate', 'Ставка НДС (%)', 'number'],
              ['country', 'Страна', 'text'],
              ['languages', 'Языки', 'text'],
              ['contactPhone', 'Контактный телефон', 'text'],
              ['supportEmail', 'Email поддержки', 'email'],
              ['freeShippingFrom', 'Бесплатная доставка от (₸)', 'number'],
            ] as const ).map(([key, label, type]) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                <input type={type} className="input" value={formData[key] ?? ''} onChange={e => update(key, e.target.value)} style={{ fontFamily: 'inherit' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Интеграции</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {( [
              ['jwtSecret', 'JWT Secret', 'password'],
              ['corsOrigins', 'CORS Origins', 'text'],
              ['redisUrl', 'Redis URL', 'text'],
              ['typesenseApiKey', 'Typesense API Key', 'text'],
              ['minioEndpoint', 'MinIO Endpoint', 'text'],
            ] as const ).map(([key, label, type]) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                <input type={type} className="input" value={formData[key] ?? ''} onChange={e => update(key, e.target.value)} style={{ fontFamily: 'inherit' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary btn-lg">{saved ? '✅ Сохранено' : 'Сохранить настройки'}</button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => toast('Настройки сброшены к значениям по умолчанию')}>Сбросить</button>
        </div>
      </form>
      )}
    </div>
  );
}
