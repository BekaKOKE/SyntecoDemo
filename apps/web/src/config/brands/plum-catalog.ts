import type { BrandCatalogCategory } from './types';

/**
 * Plum Safety product catalog mirroring the official plum.eu taxonomy.
 * Source: https://plum.eu/products/
 *
 * Nine official product categories with direct links to the category and
 * product-line pages, and official Plum product images.
 */
const U = 'https://plum.eu/wp-content/uploads/';
const IMG_WOUND = U + 'yootheme/cache/61/Kategori_Wound-and-Eyewash_product-range_with-lid-61da6fdd.webp';
const IMG_COH = U + 'yootheme/cache/cd/CohesiveBandage_dispenser_refills-cd84210e.webp';
const IMG_OPEN = U + 'yootheme/cache/2e/Kategoribilleder_Open-stations_products_web-2e3c3f79.webp';
const IMG_CLOSED = U + 'yootheme/cache/03/Kategoribilleder_Closed-stations_products_web-03cb08a3.webp';
const IMG_FAS = U + 'yootheme/cache/32/5184_Plum-1Aid-Station-32b23b1b.webp';
const IMG_BAGS = U + 'yootheme/cache/17/4960_4961_bag_front-170cceb7.webp';
const IMG_DECON = U + 'yootheme/cache/0e/4735-4736-4737_BodyNeutrAll_all-products-1-0e3a8f55.webp';
const IMG_ACC = U + 'yootheme/cache/59/4080025_First-Aid-Sign-label_1000x1000-5987da06.webp';

export const plumCatalog: BrandCatalogCategory[] = [
  {
    name: 'Wound and Eyewash',
    slug: 'wound-and-eyewash',
    iconName: 'shield',
    descriptionRu: 'Растворы для промывания глаз и ран: физраствор и pH-нейтральный фосфатный буфер',
    subcategories: [
      { name: 'Sodium Chloride 0.9% / 200 ml', url: 'https://plum.eu/wound-and-eyewash/plum-wound-and-eyewash-0-9-sodium-chloride-200-ml/', thumbnailUrl: IMG_WOUND },
      { name: 'Sodium Chloride 0.9% DUO / 1000 ml', url: 'https://plum.eu/bottles-for-two-eyes/plum-wound-and-eyewash-0-9-sodium-chloride-duo-1000-ml/', thumbnailUrl: IMG_WOUND },
      { name: 'pH Neutral 4.9% Phosphate DUO / 500 ml', url: 'https://plum.eu/wound-and-eyewash/plum-wound-and-eyewash-ph-neutral-4-9-phosphate-duo-500-ml/', thumbnailUrl: IMG_WOUND },
      { name: 'All Wound and Eyewash', url: 'https://plum.eu/wound-and-eyewash/', thumbnailUrl: IMG_WOUND },
    ],
  },
  {
    name: 'Plasters',
    slug: 'plasters',
    iconName: 'package',
    descriptionRu: 'Пластыри и диспенсеры Plum QuickFix для профессионального применения',
    subcategories: [
      { name: 'Plum QuickFix', url: 'https://plum.eu/brand/plum-quickfix/', thumbnailUrl: U + '5538_Plum_QuickFix_Dispenser_BlackLong.webp' },
      { name: 'QuickFix UNO', url: 'https://plum.eu/plasters/', thumbnailUrl: U + '5531_Plum_QuickFix_UNO_transparent-_Elastic.webp' },
      { name: 'QuickFix Refills', url: 'https://plum.eu/plasters/', thumbnailUrl: U + '5524_QuickFix_XRay_Closed.webp' },
    ],
  },
  {
    name: 'Cohesive bandage',
    slug: 'cohesive-bandage',
    iconName: 'package',
    descriptionRu: 'Самофиксирующиеся когезивные бинты Plum QuickSoft без латекса',
    subcategories: [
      { name: 'Plum QuickSoft', url: 'https://plum.eu/brand/plum-quicksoft-cohesive-bandage/', thumbnailUrl: IMG_COH },
      { name: 'All Cohesive bandage', url: 'https://plum.eu/cohesive-bandage/', thumbnailUrl: IMG_COH },
    ],
  },
  {
    name: 'Open stations',
    slug: 'open-stations',
    iconName: 'shield',
    descriptionRu: 'Настенные открытые станции для быстрого доступа к средствам первой помощи',
    subcategories: [
      { name: 'Plum Open Stations', url: 'https://plum.eu/brand/plum-open-stations/', thumbnailUrl: IMG_OPEN },
      { name: 'All Open stations', url: 'https://plum.eu/open-stations/', thumbnailUrl: IMG_OPEN },
    ],
  },
  {
    name: 'Closed stations',
    slug: 'closed-stations',
    iconName: 'lock',
    descriptionRu: 'Закрытые пылезащитные боксы Plum iBox и Green Box',
    subcategories: [
      { name: 'Plum iBox', url: 'https://plum.eu/brand/plum-ibox/', thumbnailUrl: IMG_CLOSED },
      { name: 'Plum Green Box', url: 'https://plum.eu/brand/plum-green-box/', thumbnailUrl: IMG_CLOSED },
      { name: 'All Closed stations', url: 'https://plum.eu/closed-stations/', thumbnailUrl: IMG_CLOSED },
    ],
  },
  {
    name: 'First Aid stations',
    slug: 'first-aid-stations',
    iconName: 'package',
    descriptionRu: 'Станции первой помощи Plum QuickSafe и 1Aid для рабочих мест',
    subcategories: [
      { name: 'Plum QuickSafe', url: 'https://plum.eu/brand/plum-quicksafe/', thumbnailUrl: IMG_FAS },
      { name: 'Plum QuickSafe Solo', url: 'https://plum.eu/brand/plum-quicksafe-solo/', thumbnailUrl: IMG_FAS },
      { name: 'Plum 1Aid Station', url: 'https://plum.eu/brand/plum-1aid-station/', thumbnailUrl: IMG_FAS },
      { name: 'All First Aid stations', url: 'https://plum.eu/first-aid-stations/', thumbnailUrl: IMG_FAS },
    ],
  },
  {
    name: 'First Aid bags',
    slug: 'first-aid-bags',
    iconName: 'package',
    descriptionRu: 'Портативные сумки первой помощи Plum 1Aid для ношения на поясе',
    subcategories: [
      { name: 'Plum 1Aid Bag', url: 'https://plum.eu/brand/plum-1aid-bag/', thumbnailUrl: IMG_BAGS },
      { name: 'All First Aid bags', url: 'https://plum.eu/first-aid-bags/', thumbnailUrl: IMG_BAGS },
    ],
  },
  {
    name: 'Decontamination',
    slug: 'decontamination',
    iconName: 'warning',
    descriptionRu: 'Средства деконтаминации Plum BodyNeutrAll при контакте с кислотами и щелочами',
    subcategories: [
      { name: 'Plum BodyNeutrAll', url: 'https://plum.eu/brand/bodyneutrall/', thumbnailUrl: IMG_DECON },
      { name: 'All Decontamination', url: 'https://plum.eu/decontamination/', thumbnailUrl: IMG_DECON },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    iconName: 'wrench',
    descriptionRu: 'Аксессуары для станций и флаконов: держатели, крепления, таблички',
    subcategories: [
      { name: 'All Accessories', url: 'https://plum.eu/accessories/', thumbnailUrl: IMG_ACC },
    ],
  },
];
