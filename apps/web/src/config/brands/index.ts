import type { BrandConfig } from './types';
import { honeywell } from './honeywell';
import { pip } from './pip';
import { threeM } from './three-m';
import { masterLock } from './master-lock';
import { ansul } from './ansul';
import { uvex } from './uvex';
import { armacell } from './armacell';
import { heinzGlas } from './heinz-glas';
import { peli } from './peli';
import { plum } from './plum';
import { rosenbauer } from './rosenbauer';
import { sata } from './sata';
import { tyco } from './tyco';
import { univet } from './univet';

/**
 * Registry of all official distributor brands.
 * Only brands listed here get a /brands/[slug] page.
 * All other brands in the DB redirect to /products?search=BrandName.
 */
export const OFFICIAL_BRANDS: BrandConfig[] = [
  honeywell,
  pip,
  threeM,
  masterLock,
  ansul,
  uvex,
  armacell,
  heinzGlas,
  peli,
  plum,
  rosenbauer,
  sata,
  tyco,
  univet,
];

/** Map: slug → BrandConfig, for O(1) lookup on /brands/[slug] pages. */
export const BRAND_REGISTRY: Record<string, BrandConfig> = Object.fromEntries(
  OFFICIAL_BRANDS.map((b) => [b.slug, b]),
);

/** Get a brand config by slug, or undefined if not an official distributor. */
export function getBrandConfig(slug: string): BrandConfig | undefined {
  return BRAND_REGISTRY[slug];
}

/** Get all official distributor brands (for homepage grid). */
export function getOfficialBrands(): BrandConfig[] {
  return OFFICIAL_BRANDS;
}

/**
 * Find an official brand slug by brand name (case-insensitive, ignores
 * punctuation/spacing). Returns undefined if the brand is not an official
 * distributor — so callers can fall back to a product page or search.
 */
export function getBrandSlugByName(name: string): string | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(name);
  if (!target) return undefined;
  const brand = OFFICIAL_BRANDS.find(
    (b) => norm(b.name) === target || norm(b.slug) === target,
  );
  return brand?.slug;
}
