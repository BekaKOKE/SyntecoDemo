'use client';

import { Component, type ReactNode } from 'react';
import { Icons } from '@/lib/icons';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12, color: 'var(--color-warn)' }}>
            <Icons.warning width={40} height={40} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Что-то пошло не так</h3>
          <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            Попробуйте обновить страницу или вернуться позже.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
