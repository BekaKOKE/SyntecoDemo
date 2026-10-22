'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Icons } from '@/lib/icons';

interface ToastItem {
  id: string;
  text: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  toast: (text: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '12px 20px', borderRadius: 12,
              background: t.type === 'success' ? 'var(--color-ink)' : 'var(--color-accent)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: 'var(--shadow-2)',
              animation: 'fadeUp 0.3s ease',
              minWidth: 200,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {t.type === 'success'
              ? <Icons.check width={14} height={14} />
              : <Icons.close width={14} height={14} />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
