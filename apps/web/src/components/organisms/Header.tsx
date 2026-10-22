'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/context/auth-context';
import { useCart } from '@/lib/context/cart-context';
import { Icons } from '@/lib/icons';
import { SearchBar } from '@/components/molecules/SearchBar';
import { MegaMenu, MobileCatalogMenu } from './MegaMenu';
import { getNotifications, NOTIFICATIONS_CHANGED } from '@/lib/api/notifications';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, justAdded } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Shared 36×36 icon-button style for the mobile header row.
  const iconBtn: React.CSSProperties = {
    width: 36, height: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-ink)', flexShrink: 0,
    borderRadius: 8, cursor: 'pointer',
  };

  // Quick-link tile inside the burger menu.
  const quickLinkStyle: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: 14, fontWeight: 600, color: 'var(--color-ink)',
    borderRadius: 8, background: 'var(--color-surface-2)',
  };

  useEffect(() => {
    fetch('/api/v1/categories/tree')
      .then(r => r.json())
      .then(d => setCats(Array.isArray(d) ? d : d?.data ?? d ?? []))
      .catch(() => {});
  }, []);

  // Unread notifications badge — refreshed on navigation and after mark-as-read
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) { setUnread(0); return; }
    const load = () => getNotifications().then(d => setUnread(d.unread ?? 0)).catch(() => {});
    load();
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, load);
  }, [isAuthenticated, pathname]);

  // Cart icon pulse on item add
  const [cartPulse, setCartPulse] = useState(false);
  useEffect(() => {
    if (justAdded === 0) return;
    setCartPulse(true);
    const timer = setTimeout(() => setCartPulse(false), 600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  // Close desktop mega-menu on click outside
  useEffect(() => {
    if (!menuOpen && !mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, mobileOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const rootCats = cats.filter((c: any) => !c.parentId || c.level === 1).slice(0, 20);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        // The full-screen mobile menu below is a child of this header, so its
        // own z-index is scoped to this stacking context — at 100 the floating
        // WhatsApp dock (900) painted on top of the open menu.
        zIndex: 1000,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-hair)',
      }}
      ref={menuRef}
    >

      {/* ── Main nav row ── */}
      <div className="container-site" style={{ display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image
            src="/logo.png"
            alt="Synteco — Reliable Industrial Services"
            width={189}
            height={48}
            priority
            unoptimized
            className="header-logo"
            style={{ height: 48, width: 'auto', display: 'block' }}
          />
        </Link>

        {/* Catalog button + mega menu (desktop only) */}
        <div className="hide-mobile hdr-nav" style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-primary"
            style={{ gap: 6, height: 40, padding: '0 18px', fontWeight: 600 }}
          >
            <Icons.menu /> <span>Навигация</span>
            <Icons.chevD width={14} height={14} style={{ flexShrink: 0, transform: menuOpen ? 'rotate(180deg)' : '', transition: 'transform .15s' }} />
          </button>
          {menuOpen && <MegaMenu cats={cats} onClose={() => setMenuOpen(false)} />}
        </div>

        {/* Desktop search */}
        <div className="hide-mobile hdr-search" style={{ flex: '1 1 720px', maxWidth: 760, minWidth: 280 }}>
          <SearchBar />
        </div>

        {/* Cart + Account (desktop) */}
        <div className="hide-mobile hdr-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Link href="/contacts" className="btn btn-ghost hdr-phone" aria-label="Телефон" title="+7 702 475 17 03" style={{ gap: 6, padding: '0 10px', color: 'var(--color-accent)', borderColor: 'rgba(204, 0, 0, 0.24)', fontWeight: 700 }}>
            <Icons.phone />
            <span>+7 702 475 17 03</span>
          </Link>
          <Link href="/cart" className="btn btn-ghost hdr-cart" style={{ position: 'relative', gap: 6, animation: cartPulse ? 'cart-pop 0.5s ease' : 'none' }}>
            <Icons.cart /><span>Корзина</span>
            {cart.itemCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-accent)', color: '#fff', fontSize: 10, fontWeight: 600, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.itemCount}</span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/accounts/notifications" className="btn btn-ghost" aria-label="Уведомления" title="Уведомления" style={{ position: 'relative', padding: '0 10px' }}>
                <Icons.bell />
                {unread > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-accent)', color: '#fff', fontSize: 10, fontWeight: 600, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 99 ? '99+' : unread}</span>
                )}
              </Link>
              <Link href="/accounts/dashboard" className="btn btn-ghost hdr-account" style={{ gap: 6 }}>
                <Icons.user /><span>{user?.firstName || 'Кабинет'}</span>
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm">Выйти</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hdr-login" style={{ gap: 6 }}>
                <Icons.user /><span>Войти</span>
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm hdr-register">Регистрация</Link>
            </>
          )}
        </div>

        {/* ── Mobile header bar ── */}
        <div className="show-mobile hdr-mobile" style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <Link href="/search" aria-label="Поиск" style={iconBtn}>
            <Icons.search />
          </Link>
          <Link href="/cart" aria-label="Корзина" style={{ ...iconBtn, position: 'relative', animation: cartPulse ? 'cart-pop 0.5s ease' : 'none' }}>
            <Icons.cart />
            {cart.itemCount > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-accent)', color: '#fff', fontSize: 9, fontWeight: 700, minWidth: 14, height: 14, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--color-surface)' }}>{cart.itemCount}</span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(true)} aria-label="Меню" style={{ ...iconBtn, background: 'transparent', border: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Category bar (desktop only) ── */}
      <div className="hide-mobile hdr-catbar" style={{ borderTop: '1px solid var(--color-hair)', background: 'var(--color-surface-2)' }}>
        <div className="container-site" style={{ display: 'flex', gap: 0, overflowX: 'auto', height: 36 }}>
          {rootCats.slice(0, 10).map((cat: any) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} style={{ display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-2)', whiteSpace: 'nowrap', borderRight: '1px solid var(--color-hair)' }}>
              {cat.name}
            </Link>
          ))}
          <Link href="/categories" style={{ display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>
            Все категории →
          </Link>
        </div>
      </div>

      {/* ── Mobile full-screen menu ── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
          {/* Mobile menu header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-hair)', height: 56 }}>
            <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="26" height="26" viewBox="0 0 32 32"><rect x="0" y="0" width="32" height="32" rx="7" fill="var(--color-ink)"/><path d="M9 10 L22 10 L22 14 L13 14 L13 15 L22 15 L22 22 L9 22 L9 18 L18 18 L18 17 L9 17 Z" fill="var(--color-accent)"/></svg>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Synteco</div>
            </Link>
            <button onClick={() => setMobileOpen(false)}
              style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, color: 'var(--color-ink)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Quick links — primary navigation that used to live in the header row */}
          <nav style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <Link href="/" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Главная</Link>
            <Link href="/categories" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Каталог</Link>
            <Link href="/brands" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Бренды</Link>
            <Link href="/search" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Поиск</Link>
            <Link href="/branches" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Филиалы</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>О компании</Link>
            <Link href="/feedback" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Обратная связь</Link>
            <Link href="/contacts" onClick={() => setMobileOpen(false)} style={quickLinkStyle}>Контакты</Link>
          </nav>

          <MobileCatalogMenu cats={cats} onClose={() => setMobileOpen(false)} />

          {/* Account section */}
          <div style={{ borderTop: '1px solid var(--color-hair)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isAuthenticated ? (
              <>
                <Link href="/accounts/dashboard" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                  {user?.firstName} {user?.lastName}
                </Link>
                <Link href="/accounts/orders" onClick={() => setMobileOpen(false)} style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>Мои заказы</Link>
                <Link href="/accounts/notifications" onClick={() => setMobileOpen(false)} style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>
                  Уведомления{unread > 0 && <span className="num" style={{ color: 'var(--color-accent)', fontWeight: 700 }}> · {unread}</span>}
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} style={{ fontSize: 13, color: 'var(--color-ink-3)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>Выйти</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-block" style={{ height: 44 }}>Войти</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-secondary btn-block" style={{ height: 44 }}>Регистрация</Link>
              </>
            )}
            <Link href="/contacts" style={{ fontSize: 11, color: 'var(--color-ink-4)', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
              +7 702 475 17 03 · Доставка по Казахстану
            </Link>
          </div>
        </div>
      )}
      <style>{`
        @keyframes cart-pop {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.25); }
          60%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </header>
  );
}

/* (MobileSearchBar removed — search now lives in the header row as a /search link icon.) */
