'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ToastItem {
  id: string;
  text: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  pushToast: (text: string, type?: 'success' | 'error') => void;
  toast: (text: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue>({ pushToast: () => {}, toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast, toast: pushToast }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="badge" />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
