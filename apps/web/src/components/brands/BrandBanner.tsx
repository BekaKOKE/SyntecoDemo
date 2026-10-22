import Image from 'next/image';
import type { BrandConfig } from '@/config/brands/types';
import { Icons } from '@/lib/icons';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function brandHeroBackground(brand: BrandConfig) {
  if (brand.heroGradient) return brand.heroGradient;

  const rgb = hexToRgb(brand.heroColor);
  const isRed = rgb ? rgb.r > 150 && rgb.g < 75 && rgb.b < 75 : false;
  const isMono = rgb ? rgb.r < 36 && rgb.g < 36 && rgb.b < 36 : false;

  if (isRed) {
    return [
      'radial-gradient(circle at 82% 18%, rgba(255,255,255,0.18), transparent 26%)',
      'radial-gradient(circle at 12% 92%, rgba(0,0,0,0.38), transparent 35%)',
      'linear-gradient(135deg, #240304 0%, #5b0709 42%, #9d0b0f 100%)',
    ].join(', ');
  }

  if (isMono) {
    return [
      'radial-gradient(circle at 84% 16%, rgba(255,255,255,0.14), transparent 26%)',
      'linear-gradient(135deg, #050607 0%, #171a1f 48%, #30343b 100%)',
    ].join(', ');
  }

  return [
    'radial-gradient(circle at 84% 16%, rgba(255,255,255,0.18), transparent 26%)',
    `linear-gradient(135deg, #07111f 0%, ${brand.heroColor} 52%, #0b0c0e 100%)`,
  ].join(', ');
}

export function BrandBanner({ brand }: { brand: BrandConfig }) {
  const isLight = brand.heroTextColor === 'light';
  const text = isLight ? '#fff' : 'var(--color-ink)';
  const subtext = isLight ? 'rgba(255,255,255,0.82)' : 'var(--color-ink-3)';
  const chipBg = isLight ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.06)';
  const chipBorder = isLight ? 'rgba(255,255,255,0.24)' : 'var(--color-hair)';

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: brandHeroBackground(brand),
        color: text,
        padding: '24px 0 28px',
        borderBottom: '1px solid var(--color-hair)',
      }}
    >
      <div
        className="container-site brand-hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 0.78fr) minmax(0, 1.45fr) minmax(260px, 0.82fr)',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 'min(100%, 170px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            border: '1px solid rgba(255,255,255,0.56)',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 18px 44px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          <Image
            src={brand.logoUrl}
            alt={`${brand.name} — официальный дистрибьютор`}
            width={162}
            height={110}
            priority
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: subtext,
            }}
          >
            Официальный дистрибьютор
          </div>
          <h1
            style={{
              marginTop: 6,
              color: text,
              fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 760,
              lineHeight: 1.08,
              letterSpacing: 0,
            }}
          >
            {brand.name} в Казахстане
          </h1>
          <p
            style={{
              marginTop: 12,
              maxWidth: 640,
              color: subtext,
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            {brand.taglineRu}
            <br />
            <span style={{ opacity: 0.9 }}>
              Производство: {brand.country}. С {brand.established} г.
            </span>
          </p>

          {brand.certifications.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {brand.certifications.map((cert) => (
                <span
                  key={cert}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    border: `1px solid ${chipBorder}`,
                    borderRadius: 999,
                    background: chipBg,
                    color: text,
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                  title={`Сертификат ${cert}`}
                >
                  <Icons.check width={12} height={12} /> {cert}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
            <a
              href="/contacts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.32)',
                borderRadius: 6,
                background: '#fff',
                color: '#141518',
                fontSize: 13,
                fontWeight: 750,
                textDecoration: 'none',
              }}
            >
              <Icons.docText width={14} height={14} /> Запросить каталог
            </a>
            <a
              href="/contacts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                border: `1px solid ${chipBorder}`,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.12)',
                color: text,
                fontSize: 13,
                fontWeight: 750,
                textDecoration: 'none',
              }}
            >
              <Icons.chat width={14} height={14} /> Запросить КП
            </a>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 10,
            padding: 16,
            border: `1px solid ${chipBorder}`,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.10)',
            boxShadow: '0 16px 38px rgba(0,0,0,0.14)',
          }}
        >
          {[
            ['Статус', 'Официальный дистрибьютор'],
            ['Поставка', 'B2B-заказы и КП'],
            ['Документы', 'Сертификаты и каталоги'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                paddingBottom: label === 'Документы' ? 0 : 10,
                borderBottom: label === 'Документы' ? 0 : `1px solid ${chipBorder}`,
              }}
            >
              <div style={{ color: subtext, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {label}
              </div>
              <div style={{ marginTop: 3, color: text, fontSize: 13, fontWeight: 750 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
