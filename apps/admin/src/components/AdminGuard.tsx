'use client';

import { useAuth } from '@/lib/context/auth-context';
import { canAccessAdminScreen, defaultAdminPath } from '@/lib/roles';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, canAccessPanel, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentScreen = pathname.split('/').filter(Boolean)[0] || 'dashboard';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !user) return;
    if (!canAccessAdminScreen(user.role, currentScreen)) {
      router.replace(defaultAdminPath(user.role));
    }
  }, [currentScreen, loading, router, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting
  }

  if (!canAccessPanel) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: 60, textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>Доступ запрещён</div>
          <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
            У вашей учётной записи нет прав администратора. Обратитесь к руководителю для получения доступа.
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => router.push('/login')}>
            Войти под другой учётной записью
          </button>
        </div>
      </div>
    );
  }

  if (user && !canAccessAdminScreen(user.role, currentScreen)) {
    return null;
  }

  return <>{children}</>;
}
