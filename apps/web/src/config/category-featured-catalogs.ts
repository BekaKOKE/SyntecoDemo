import type { BrandCatalogCategory, BrandConfig } from './brands/types';
import { pip } from './brands/pip';
import { uvex } from './brands/uvex';
import { honeywell } from './brands/honeywell';
import { threeM } from './brands/three-m';
import { univet } from './brands/univet';
import { plum } from './brands/plum';
import { masterLock } from './brands/master-lock';
import { ansul } from './brands/ansul';
import { peli } from './brands/peli';
import { sata } from './brands/sata';
import { tyco } from './brands/tyco';
import { rosenbauer } from './brands/rosenbauer';
import { heinzGlas } from './brands/heinz-glas';
import { armacell } from './brands/armacell';

/**
 * Featured official-brand catalogs shown at the top of /categories/[slug].
 *
 * Each site category lists the official brands relevant to it, and for each
 * brand — only the направления (top-level catalog categories) that belong to
 * that site category. Every направление links out to the manufacturer's
 * official site, with clear brand attribution (logo + name).
 */

export interface CategoryFeaturedBrand {
  brandSlug: string;
  brandName: string;
  brandColor: string;
  logoUrl: string;
  website: string;
  /** Направления of this brand relevant to the site category. */
  catalog: BrandCatalogCategory[];
}

export interface CategoryFeaturedCatalogConfig {
  title: string;
  description: string;
  brands: CategoryFeaturedBrand[];
}

/**
 * Build a CategoryFeaturedBrand from a BrandConfig.
 * - `slugs` — pick only these top-level catalog categories (order preserved).
 *   When omitted, the brand's full catalog is used.
 * - `catalog` — explicit catalog override (for brands without productCatalog).
 */
function featured(
  brand: BrandConfig,
  opts?: { slugs?: string[]; catalog?: BrandCatalogCategory[] },
): CategoryFeaturedBrand {
  const source = opts?.catalog ?? brand.productCatalog ?? [];
  const catalog = opts?.slugs
    ? opts.slugs
        .map((slug) => source.find((c) => c.slug === slug))
        .filter((c): c is BrandCatalogCategory => Boolean(c))
    : source;

  return {
    brandSlug: brand.slug,
    brandName: brand.name,
    brandColor: brand.heroColor,
    logoUrl: brand.logoUrl,
    website: brand.website,
    catalog,
  };
}

/**
 * Armacell has no full productCatalog — a compact plumbing/insulation
 * selection with verified links to the official armacell.com pages.
 */
const armacellPlumbingCatalog: BrandCatalogCategory[] = [
  {
    name: 'Pipe & Technical Insulation',
    slug: 'pipe-technical-insulation',
    iconName: 'package',
    descriptionRu: 'Трубная и техническая изоляция Armacell для инженерных систем',
    subcategories: [
      { name: 'Pipe Insulation', url: 'https://www.armacell.com' },
      { name: 'Insulation Solutions Overview', url: 'https://www.armacell.com' },
      { name: 'Thermal Insulation', url: 'https://www.armacell.com' },
    ],
  },
  {
    name: 'Adhesives & Accessories',
    slug: 'adhesives-accessories',
    iconName: 'wrench',
    descriptionRu: 'Клеи и монтажные аксессуары для систем изоляции',
    subcategories: [
      { name: 'Adhesives for Insulation Systems', url: 'https://www.armacell.com' },
      { name: 'Insulation Tape & Accessories', url: 'https://www.armacell.com' },
    ],
  },
];

export const CATEGORY_FEATURED_CATALOGS: Record<string, CategoryFeaturedCatalogConfig> = {
  bezopasnost: {
    title: 'Официальные бренды: средства защиты по направлениям',
    description:
      'Выберите бренд и направление — все ссылки ведут в официальные каталоги производителей и открываются в новой вкладке.',
    brands: [
      featured(pip),
      featured(uvex),
      featured(honeywell, { slugs: ['personal-protective-equipment'] }),
      featured(threeM, { slugs: ['ppe'] }),
      featured(univet),
      featured(plum),
      featured(masterLock, { slugs: ['lockout-tagout'] }),
      featured(ansul, { slugs: ['portable-fire-extinguishers-and-spill-control'] }),
      featured(peli, { slugs: ['torches'] }),
    ],
  },
  instrumenty: {
    title: 'Официальные бренды: инструмент и оснастка',
    description:
      'Абразивы, инструмент, окрасочное оборудование и защитные кейсы — напрямую из официальных каталогов производителей.',
    brands: [
      featured(threeM, { slugs: ['abrasives', 'tools-equipment', 'compounds-polishes'] }),
      featured(sata, { slugs: ['spray-guns', 'cup-systems', 'accessories-and-more'] }),
      featured(peli, { slugs: ['cases', 'torches'] }),
    ],
  },
  elektrika: {
    title: 'Официальные бренды: электрика и электробезопасность',
    description:
      'Электротехнические материалы, датчики и решения для электробезопасности из официальных каталогов.',
    brands: [
      featured(threeM, { slugs: ['electrical'] }),
      featured(pip, { slugs: ['electrical-safety'] }),
      featured(honeywell, { slugs: ['sensing-solutions'] }),
      featured(masterLock, { slugs: ['lockout-tagout'] }),
    ],
  },
  pnevmatika: {
    title: 'Официальные бренды: пневматика и подготовка воздуха',
    description:
      'Фильтрация и подготовка сжатого воздуха, датчики и сенсорика — из официальных каталогов производителей.',
    brands: [
      featured(sata, { slugs: ['filter-technology'] }),
      featured(honeywell, { slugs: ['sensing-solutions'] }),
    ],
  },
  krepezh: {
    title: 'Официальные бренды: клеи, герметики и монтажные ленты',
    description:
      'Промышленные клеевые системы и ленты 3M как альтернатива механическому крепежу — официальный каталог производителя.',
    brands: [featured(threeM, { slugs: ['adhesives', 'tapes'] })],
  },
  svarka: {
    title: 'Официальные бренды: сварка и зачистка',
    description:
      'Защита сварщика и абразивы для подготовки и зачистки швов — напрямую из официальных каталогов.',
    brands: [
      featured(pip, { slugs: ['welding-protection'] }),
      featured(threeM, { slugs: ['abrasives', 'ppe'] }),
    ],
  },
  santekhnika: {
    title: 'Официальные бренды: трубопроводы и изоляция',
    description:
      'Изоляция трубопроводов, муфтовые соединения и клапаны — из официальных каталогов производителей.',
    brands: [
      featured(armacell, { catalog: armacellPlumbingCatalog }),
      featured(tyco, { slugs: ['grooved-products', 'valves-and-accessories'] }),
    ],
  },
  uborka: {
    title: 'Официальные бренды: уборка и деконтаминация',
    description:
      'Профессиональные средства уборки и решения для деконтаминации — официальные каталоги производителей.',
    brands: [
      featured(threeM, { slugs: ['cleaning-supplies'] }),
      featured(plum, { slugs: ['decontamination'] }),
    ],
  },
  upakovka: {
    title: 'Официальные бренды: упаковка и маркировка',
    description:
      'Стеклянная упаковка, промышленные ленты, этикетки и защитные кейсы — из официальных каталогов.',
    brands: [
      featured(heinzGlas),
      featured(threeM, { slugs: ['tapes', 'labels', 'films-sheeting'] }),
      featured(peli, { slugs: ['cases', 'luggage-coolers'] }),
    ],
  },
  laboratoriya: {
    title: 'Официальные бренды: лаборатория и чистые помещения',
    description:
      'Лабораторные расходники, оптика для чистых помещений, первая помощь и защитные кейсы — официальные каталоги.',
    brands: [
      featured(threeM, { slugs: ['lab-supplies-testing', 'filtration-separation'] }),
      featured(univet, { slugs: ['medical-cleanroom', 'laser-protection'] }),
      featured(plum, { slugs: ['wound-and-eyewash', 'first-aid-stations'] }),
      featured(peli, { slugs: ['cases'] }),
    ],
  },
  avtopark: {
    title: 'Официальные бренды: автопарк и авторемонт',
    description:
      'Окрасочные системы, автоматериалы, противопожарная защита техники и замки — из официальных каталогов.',
    brands: [
      featured(sata),
      featured(threeM, { slugs: ['automotive-parts-hardware', 'compounds-polishes'] }),
      featured(ansul, { slugs: ['vehicle-systems'] }),
      featured(masterLock, { slugs: ['padlocks', 'chain-and-cable-locks', 'trailers-and-towing'] }),
      featured(rosenbauer, { slugs: ['vehicles'] }),
    ],
  },
};
