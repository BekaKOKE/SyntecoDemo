'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/context/auth-context';
import { canAccessAdminScreen, defaultAdminPath } from '@/lib/roles';
import { ToastProvider } from '@/components/Toast';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ScreenTabs } from '@/components/ScreenTabs';
import type { ReactNode } from 'react';

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, canAccessPanel, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const currentScreen = pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (loading || isLoginPage || !user) return;
    if (!canAccessAdminScreen(user.role, currentScreen)) {
      router.replace(defaultAdminPath(user.role));
    }
  }, [currentScreen, isLoginPage, loading, router, user]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  if (!canAccessPanel) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="card" style={{ padding: 60, textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>Доступ запрещён</div>
          <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
            У вашей учётной записи нет прав администратора. Обратитесь к руководителю для получения доступа.
          </div>
        </div>
      </div>
    );
  }

  if (user && !canAccessAdminScreen(user.role, currentScreen)) {
    return null;
  }

  return (
    <div className="app">
      {/* Mobile sidebar overlay backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay show-mobile"
          onClick={() => setSidebarOpen(false)}
          aria-label="Закрыть меню"
        />
      )}
      <Sidebar className={sidebarOpen ? 'open' : ''} onLinkClick={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="fade-up">{children}</div>
      </div>
      <ScreenTabs />
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGate>{children}</AuthGate>
      </ToastProvider>
    </AuthProvider>
  );
}
