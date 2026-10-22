/**
 * Brand configuration types.
 *
 * Each official distributor brand has a BrandConfig in
 * apps/web/src/config/brands/[slug].ts. Facets are NOT defined here — they
 * are computed at runtime from Product.attributes via the /products/facets
 * endpoint.
 */

export interface BrandConfig {
  /** URL slug, matches Brand.slug in DB — e.g., 'honeywell' */
  slug: string;
  /** Display name — e.g., 'Honeywell' */
  name: string;
  /** Legal entity name for SEO/disclaimer — e.g., 'Honeywell International Inc.' */
  legalName: string;
  /** Path to logo under /public — e.g., '/brands/honeywell/logo.webp' */
  logoUrl: string;
  /** Official brand website — e.g., 'https://honeywell.com' */
  website: string;
  /** Short Russian tagline shown in hero — e.g., 'Пожарная безопасность и СИЗ' */
  taglineRu: string;
  /** Long-form description (2-3 paragraphs). Empty at launch, filled later. */
  descriptionRu: string;
  /** Hero banner background color (hex) — e.g., '#FF0000' */
  heroColor: string;
  /** Optional brand-specific CSS background (usually a layered gradient). */
  heroGradient?: string;
  /** Text color on hero: 'light' for dark backgrounds, 'dark' for light backgrounds */
  heroTextColor: 'light' | 'dark';
  /** Year the brand was established */
  established: number;
  /** Country of origin — e.g., 'США' */
  country: string;
  /** Certification chips shown in hero — e.g., ['NIOSH', 'ANSI Z87.1', 'CE'] */
  certifications: string[];
  /** Industries the brand serves — e.g., ['Нефтегаз', 'Химия'] */
  industries: string[];
  /** Curated category list for this brand's catalog */
  categories: BrandCategory[];
  /**
   * Navigable product catalog mirroring the manufacturer's taxonomy.
   * When present, BrandCatalogExplorer renders a master-detail navigator
   * (sidebar + subcategory tiles that link out to the official site).
   */
  productCatalog?: BrandCatalogCategory[];
  /** Optional feature blocks (added later) */
  featureBlocks?: FeatureBlock[];
}

export interface BrandCategory {
  /** Display name — e.g., 'СИЗ (средства индивидуальной защиты)' */
  name: string;
  /** Optional icon key from the Icons library */
  iconName?: string;
  /** Optional short description */
  description?: string;
  /**
   * Optional link to the matching section on the brand's official site.
   * When present, the category card in BrandCatalog becomes clickable and
   * opens this URL in a new tab.
   */
  url?: string;
}

/**
 * A navigable product catalog for a brand, mirroring the manufacturer's own
 * taxonomy. Each top-level category maps to a section on the brand's official
 * site and contains its subcategories. Clicking a subcategory opens the
 * corresponding page on the official site in a new tab.
 *
 * Used by BrandCatalogExplorer to render a master-detail navigator on the
 * brand landing page (e.g. /brands/pip).
 */
export interface BrandCatalogCategory {
  /** Display name — e.g., 'Arm Protection' */
  name: string;
  /** URL slug for in-page anchors — e.g., 'arm-protection' */
  slug: string;
  /** Optional icon key from the Icons library */
  iconName?: string;
  /** Optional short marketing copy shown under the category title */
  description?: string;
  /**
   * Optional Russian description shown to non-English users on mobile.
   * The English `name` stays (brand nomenclature), but this gives B2B
   * users context in their language. e.g. 'СИЗ с головы до ног'.
   */
  descriptionRu?: string;
  /** Subcategories. When missing, the category link points to the parent. */
  subcategories?: BrandCatalogSubcategory[];
}

/**
 * A single manufacturer product shown inside a subcategory.
 *
 * Product data mirrors the manufacturer's own catalog. Links are built from
 * the manufacturer id (`pid`) so that every card points at *that* product:
 *  - manufacturerUrl -> the product page on the manufacturer site
 *  - datasheetUrl    -> the per-product spec sheet (PDF)
 *
 * The English `name` is intentionally kept as-is: B2B buyers search by the
 * manufacturer's nomenclature. Only the description is localised.
 */
export interface BrandProduct {
  /** Manufacturer product id — e.g. PIP's pID '128353'. Unique per brand. */
  pid: string;
  /** Product line / sub-brand shown above the name — e.g. 'Kut Gard®' */
  brand: string;
  /** English product name, verbatim from the manufacturer catalog */
  name: string;
  /** Manufacturer catalog number — e.g. 'S13ATAFR/4HA-EW-ES6T' */
  sku: string;
  /** Russian description shown on the card (1-2 sentences) */
  descriptionRu: string;
  /** Application tags — e.g. ['Автопром', 'Стекольное производство'] */
  tags?: string[];
  /** Available sizes, as published by the manufacturer — e.g. '18\", 22\"' */
  sizes?: string;
  /** Available colours — e.g. 'Green' */
  colors?: string;
  /**
   * How many SKU variants (size x colour) the manufacturer lists under this
   * product. Used to explain why our product count is lower than the
   * manufacturer's item count.
   */
  variants?: number;
  /** Product photo, absolute URL on the manufacturer CDN */
  imageUrl?: string;
  /** Absolute URL of this product's page on the manufacturer site */
  manufacturerUrl: string;
  /** Absolute URL of this product's spec sheet (PDF), when published */
  datasheetUrl?: string;
}

export interface BrandCatalogSubcategory {
  /** Display name — e.g., 'Cut Resistant Sleeve' */
  name: string;
  /** Full URL to the official brand site (already includes scID/ccID) */
  url: string;
  /** Optional thumbnail URL (e.g. manufacturer CDN image) */
  thumbnailUrl?: string;
  /** Optional product count hint from the manufacturer site */
  productCount?: number;
  /**
   * Products in this subcategory. When present, the subcategory tile opens an
   * in-site product grid instead of linking straight out to the manufacturer.
   */
  products?: BrandProduct[];
}

export interface FeatureBlock {
  title: string;
  text: string;
  iconName?: string;
}
