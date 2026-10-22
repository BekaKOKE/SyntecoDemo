import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/context/auth-context';
import { CartProvider } from '@/lib/context/cart-context';
import { WishlistProvider } from '@/lib/context/wishlist-context';
import { ToastProvider } from '@/components/Toast';
import { Footer } from '@/components/organisms/Footer';
import { Header } from '@/components/organisms/Header';
import { WhatsAppButton } from '@/components/molecules/WhatsAppButton';
import { CartFly } from '@/components/molecules/CartFly';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Synteco — промышленное снабжение в Казахстане',
    template: '%s | Synteco',
  },
  description: 'B2B платформа промышленного снабжения (MRO). Инструменты, крепёж, СИЗ, электрика, подшипники, сварка. Доставка по Казахстану. Цены с НДС, ЭДО.',
  keywords: ['промышленное снабжение', 'MRO', 'B2B', 'Казахстан', 'Атырау', 'запчасти', 'инструменты', 'электрика', 'подшипники', 'сварка'],
  openGraph: {
    title: 'Synteco — промышленное снабжение в Казахстане',
    description: 'B2B платформа промышленного снабжения (MRO). Доставка по Казахстану.',
    url: 'https://synteco.kz',
    siteName: 'Synteco',
    locale: 'ru_RU',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: some browser extensions inject attributes on
    // <html>/<body> (e.g. ap-style, data-* from style/grammar tools) before
    // React hydrates, which would otherwise trigger a hydration mismatch.
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
              <Header />
              <main id="main" style={{ minHeight: '60vh' }}>
                {children}
              </main>
              <Footer />
              <WhatsAppButton />
              <CartFly />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
