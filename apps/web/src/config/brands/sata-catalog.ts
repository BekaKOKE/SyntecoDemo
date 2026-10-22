import type { BrandCatalogCategory } from './types';

/**
 * SATA product catalog mirroring the official sata.com taxonomy.
 * Source: https://www.sata.com/en/all-products/
 *
 * Official product areas (Spray guns, Cup systems, Respiratory Protection,
 * Filter Technology, Accessories) with direct links to the product-family
 * pages and official SATA product images.
 */
export const sataCatalog: BrandCatalogCategory[] = [
  {
    name: 'Spray guns',
    slug: 'spray-guns',
    iconName: 'wrench',
    descriptionRu: 'Профессиональные краскопульты: с верхним бачком, под давлением, всасывающие и аэрографы',
    subcategories: [
      { name: 'jet X', url: 'https://www.sata.com/en/jet-x/CF1931336', thumbnailUrl: 'https://www.sata.com/media/0c/37/da/1782472097/1200394_MAIN.WEBP.WEBP?ts=1782472097' },
      { name: 'SATAjet X 5500', url: 'https://www.sata.com/en/satajet-x-5500/CF1931072', thumbnailUrl: 'https://www.sata.com/media/55/4c/77/1782472097/1061697_MAIN.WEBP.WEBP?ts=1782472097' },
      { name: 'jet K', url: 'https://www.sata.com/en/jet-k/CF1931356', thumbnailUrl: 'https://www.sata.com/media/21/32/95/1782472100/1238874_MAIN.WEBP.WEBP?ts=1782472100' },
      { name: 'SATAjet 1000 B', url: 'https://www.sata.com/en/satajet-1000-b/CF1931080', thumbnailUrl: 'https://www.sata.com/media/46/24/0f/1782472098/149302_MAIN.WEBP.WEBP?ts=1782472098' },
      { name: 'SATAjet 100 B', url: 'https://www.sata.com/en/satajet-100-b/CF1931082', thumbnailUrl: 'https://www.sata.com/media/17/c7/3c/1782472099/145193_MAIN.WEBP.WEBP?ts=1782472099' },
      { name: 'SATAminijet 4400 B', url: 'https://www.sata.com/en/sataminijet-4400-b/CF1931085', thumbnailUrl: 'https://www.sata.com/media/01/04/76/1782472099/198226_MAIN.WEBP.WEBP?ts=1782472099' },
      { name: 'SATAjet 1000 K', url: 'https://www.sata.com/en/satajet-1000-k/CF1931098', thumbnailUrl: 'https://www.sata.com/media/3f/46/a9/1782472100/132118_MAIN.WEBP.WEBP?ts=1782472100' },
      { name: 'SATAjet 3000 K', url: 'https://www.sata.com/en/satajet-3000-k/CF1931096', thumbnailUrl: 'https://www.sata.com/media/0e/a5/99/1782472100/93344_MAIN.WEBP.WEBP?ts=1782472100' },
      { name: 'SATAjet H', url: 'https://www.sata.com/en/satajet-h/CF1931091', thumbnailUrl: 'https://www.sata.com/media/ca/3e/48/1782472100/23721_MAIN.WEBP.WEBP?ts=1782472100' },
      { name: 'SATAgraph 4', url: 'https://www.sata.com/en/satagraph-4/CF1931100', thumbnailUrl: 'https://www.sata.com/media/60/8c/79/1782472100/227629_MAIN.WEBP.WEBP?ts=1782472100' },
      { name: 'All Spray guns', url: 'https://www.sata.com/en/spray-guns/', thumbnailUrl: 'https://www.sata.com/media/0c/37/da/1782472097/1200394_MAIN.WEBP.WEBP?ts=1782472097' },
    ],
  },
  {
    name: 'Cup systems',
    slug: 'cup-systems',
    iconName: 'package',
    descriptionRu: 'Системы бачков SATA RPS и The Liner для чистой и точной подачи материала',
    subcategories: [
      { name: 'RPS - the Original', url: 'https://www.sata.com/en/rps-the-original/CF1931348', thumbnailUrl: 'https://www.sata.com/media/91/b7/g0/1782472101/1202100_MAIN.WEBP.WEBP?ts=1782472101' },
      { name: 'LCS - the Liner', url: 'https://www.sata.com/en/lcs-the-liner/CF1931338', thumbnailUrl: 'https://www.sata.com/media/aa/a4/d9/1782472101/1195834_MAIN.WEBP.WEBP?ts=1782472101' },
      { name: 'All Cup systems', url: 'https://www.sata.com/en/cup-systems/', thumbnailUrl: 'https://www.sata.com/media/91/b7/g0/1782472101/1202100_MAIN.WEBP.WEBP?ts=1782472101' },
    ],
  },
  {
    name: 'Respiratory Protection',
    slug: 'respiratory-protection',
    iconName: 'shield',
    descriptionRu: 'Дыхательная защита: полнолицевые капюшоны и полумаски с подачей воздуха',
    subcategories: [
      { name: 'SATA air vision 5000', url: 'https://www.sata.com/en/sata-air-vision-5000/CF1931121', thumbnailUrl: 'https://www.sata.com/media/2b/51/93/1782472102/1000249_MAIN.WEBP.WEBP?ts=1782472102' },
      { name: 'SATA vision 2000', url: 'https://www.sata.com/en/sata-vision-2000/CF1931122', thumbnailUrl: 'https://www.sata.com/media/13/2c/33/1782472102/154591_MAIN.WEBP.WEBP?ts=1782472102' },
      { name: 'air star F 2.0', url: 'https://www.sata.com/en/air-star-f-2.0/CF1931339', thumbnailUrl: 'https://www.sata.com/media/65/dd/05/1782472102/1173252_MAIN.WEBP.WEBP?ts=1782472102' },
      { name: 'SATA air star F', url: 'https://www.sata.com/en/sata-air-star-f/CF1931125', thumbnailUrl: 'https://www.sata.com/media/65/dd/05/1782472102/1173252_MAIN.WEBP.WEBP?ts=1782472102' },
      { name: 'All Respiratory Protection', url: 'https://www.sata.com/en/respiratory-protection/', thumbnailUrl: 'https://www.sata.com/media/2b/51/93/1782472102/1000249_MAIN.WEBP.WEBP?ts=1782472102' },
    ],
  },
  {
    name: 'Filter Technology',
    slug: 'filter-technology',
    iconName: 'shield',
    descriptionRu: 'Системы подготовки и очистки сжатого воздуха для окраски',
    subcategories: [
      { name: 'SATA filter 500 series', url: 'https://www.sata.com/en/sata-filter-500-series/CF1931293', thumbnailUrl: 'https://www.sata.com/media/09/70/79/1782472102/1099953_MAIN.WEBP.WEBP?ts=1782472102' },
      { name: 'SATA filter series 100', url: 'https://www.sata.com/en/sata-filter-series-100/CF1931127', thumbnailUrl: 'https://www.sata.com/media/cb/e5/51/1782472103/157420_MAIN.WEBP.WEBP?ts=1782472103' },
      { name: 'All Filter Technology', url: 'https://www.sata.com/en/filter-technology/', thumbnailUrl: 'https://www.sata.com/media/09/70/79/1782472102/1099953_MAIN.WEBP.WEBP?ts=1782472102' },
    ],
  },
  {
    name: 'Accessories & More',
    slug: 'accessories-and-more',
    iconName: 'wrench',
    descriptionRu: 'Измерение давления, освещение, сушка, очистка, антикоррозийная обработка и спецодежда',
    subcategories: [
      { name: 'adam X pro', url: 'https://www.sata.com/en/adam-x-pro/CF1931340', thumbnailUrl: 'https://www.sata.com/media/87/00/e5/1782472104/1202001_MAIN.WEBP.WEBP?ts=1782472104' },
      { name: 'SATA trueSun', url: 'https://www.sata.com/en/sata-truesun/CF1931309', thumbnailUrl: 'https://www.sata.com/media/dc/c4/68/1782472104/1006411_MAIN.WEBP.WEBP?ts=1782472104' },
      { name: 'SATA multi clean 2', url: 'https://www.sata.com/en/sata-multi-clean-2/CF1931313', thumbnailUrl: 'https://www.sata.com/media/45/4b/50/1782472103/38257_MAIN.WEBP.WEBP?ts=1782472103' },
      { name: 'SATA dry jet 2', url: 'https://www.sata.com/en/sata-dry-jet-2/CF1931359', thumbnailUrl: 'https://www.sata.com/media/2a/fe/e7/1782472104/217489_MAIN.WEBP.WEBP?ts=1782472104' },
      { name: 'SATA HRS', url: 'https://www.sata.com/en/sata-hrs/CF1931301', thumbnailUrl: 'https://www.sata.com/media/0b/b9/95/1782472103/12658_MAIN.WEBP.WEBP?ts=1782472103' },
      { name: 'SATA suit race', url: 'https://www.sata.com/en/sata-suit-race/CF1931204', thumbnailUrl: 'https://www.sata.com/media/90/54/83/1782472104/184283_MAIN.WEBP.WEBP?ts=1782472104' },
    ],
  },
];
