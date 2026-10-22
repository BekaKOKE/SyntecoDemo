'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Icons } from '@/lib/icons';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  quoted: 'КП отправлено',
  closed: 'Закрыт',
  cancelled: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'var(--color-accent)',
  in_progress: '#f59e0b',
  quoted: '#3b82f6',
  closed: '#10b981',
  cancelled: '#6b7280',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Срочный',
  normal: 'Обычный',
  low: 'Низкий',
};

export default function AccountInquiries() {
  const { isAuthenticated } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      import('@/lib/api/client').then(({ apiFetch }) => {
        apiFetch<{ data: any[] }>('/admin/inquiries/my').then(d => {
          const list = Array.isArray(d) ? d : d.data || [];
          setInquiries(list);
          setLoading(false);
        }).catch(() => setLoading(false));
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container-site" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-ink-4)' }}><Icons.lock width={40} height={40} /></div>
        <h1>Требуется авторизация</h1>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Войти</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-site" style={{ padding: '40px 24px' }}>
        <Link href="/accounts/dashboard" className="muted" style={{ fontSize: 12 }}>← Личный кабинет</Link>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 8, marginBottom: 24 }}>Мои запросы</h1>
        <div className="muted" style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container-site" style={{ padding: '40px 24px' }}>
      <Link href="/accounts/dashboard" className="muted" style={{ fontSize: 12 }}>← Личный кабинет</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600 }}>Мои запросы</h1>
        <Link href="/products" className="btn btn-primary">Новый запрос</Link>
      </div>

      {inquiries.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, color: 'var(--color-ink-4)' }}><Icons.clipboard width={40} height={40} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Запросов пока нет</h3>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>Отправьте запрос коммерческого предложения со страницы товара или через корзину.</p>
          <Link href="/products" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Перейти в каталог</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {inquiries.map(inq => {
            const items: any[] = Array.isArray(inq.items) ? inq.items : [];
            const total = items.reduce((s: number, i: any) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);

            return (
              <div key={inq.id} className="card" style={{ padding: 24 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="num" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {inq.inquiryNumber}
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: STATUS_COLORS[inq.status] + '18', color: STATUS_COLORS[inq.status],
                      }}>
                        {STATUS_LABELS[inq.status] || inq.status}
                      </span>
                      {inq.priority === 'high' && (
                        <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#fef2f2', color: '#dc2626' }}>
                          {PRIORITY_LABELS[inq.priority]}
                        </span>
                      )}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {new Date(inq.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {total > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="muted" style={{ fontSize: 11 }}>Сумма</div>
                      <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>{total.toLocaleString('ru-RU')} ₸</div>
                    </div>
                  )}
                </div>

                {/* Items */}
                {items.length > 0 && (
                  <div className="hairt" style={{ marginTop: 14, paddingTop: 14 }}>
                    <div className="muted" style={{ fontSize: 11, marginBottom: 8 }}>Позиции</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {items.map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 500 }}>{item.name || item.sku || '—'}</span>
                            <span className="muted" style={{ marginLeft: 6 }}>× {item.quantity}</span>
                          </div>
                          <span className="num">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('ru-RU')} ₸</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {inq.notes && (
                  <div className="hairt" style={{ marginTop: 14, paddingTop: 14 }}>
                    <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>Комментарий</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-ink-2)' }}>{inq.notes}</div>
                  </div>
                )}

                {/* SLA */}
                {inq.slaDueBy && (
                  <div style={{ marginTop: 12, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, color: new Date(inq.slaDueBy) < new Date() ? 'var(--color-warn)' : 'var(--color-ink-4)' }}>
                    {new Date(inq.slaDueBy) < new Date()
                      ? <><Icons.warning width={13} height={13} /> Требует внимания</>
                      : <><Icons.clock width={13} height={13} /> Ответ до {new Date(inq.slaDueBy).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
