'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

interface SidebarLink {
  label: string;
  href: string;
}

interface StaticPageProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  sidebar?: SidebarLink[];
  sidebarTitle?: string;
  heroBg?: string;
  compact?: boolean;
}

export function StaticPage({
  title,
  subtitle,
  children,
  sidebar,
  sidebarTitle = 'Навигация',
  heroBg,
  compact,
}: StaticPageProps) {
  const pathname = usePathname();
  const hasCustomHero = Boolean(heroBg);
  const heroStyle: CSSProperties = {
    padding: compact ? '34px 0' : '48px 0',
  };

  if (heroBg) {
    heroStyle.background = heroBg;
  }

  return (
    <div>
      <div className={hasCustomHero ? 'static-hero static-hero-custom' : 'static-hero'} style={heroStyle}>
        <div className="container-site static-hero-shell">
          <div className="static-hero-main">
            <div className="static-breadcrumb">
              <Link href="/">Главная</Link>
              <span>/</span>
              <span>{title}</span>
            </div>

            <div className="static-hero-eyebrow">Synteco B2B</div>
            <h1 className={compact ? 'static-hero-title compact' : 'static-hero-title'}>
              {title}
            </h1>
            <p className={compact ? 'static-hero-subtitle compact' : 'static-hero-subtitle'}>
              {subtitle}
            </p>
          </div>

          {!compact && (
            <div className="static-hero-proof hide-mobile" aria-hidden="true">
              <div>
                <strong>КП</strong>
                <span>по запросу</span>
              </div>
              <div>
                <strong>B2B</strong>
                <span>документы</span>
              </div>
              <div>
                <strong>KZ</strong>
                <span>поставка</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-site page-pad">
        {sidebar ? (
          <div className="layout-sidebar" style={{ alignItems: 'start' }}>
            <aside className="sidebar-nav static-sidebar-card">
              <div className="hide-mobile static-sidebar-title">
                {sidebarTitle}
              </div>
              <div className="show-mobile static-mobile-nav">
                {sidebar.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={i} href={link.href} className={isActive ? 'active' : ''}>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              <nav className="hide-mobile static-sidebar-list">
                {sidebar.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={i}
                      href={link.href}
                      className={isActive ? 'static-sidebar-link active' : 'static-sidebar-link'}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <div style={{ minWidth: 0 }}>{children}</div>
          </div>
        ) : (
          <div style={{ maxWidth: 920 }}>{children}</div>
        )}
      </div>
    </div>
  );
}
