import type { BrandCatalogCategory } from './types';

/**
 * Tyco Fire Products catalog mirroring the official tyco-fire.com taxonomy.
 * Source: https://www.tyco-fire.com/products-and-solutions
 *
 * Sprinkler subcategories use their official per-page thumbnails; other groups
 * use the official Tyco category-card images from the product hub.
 */
const B = 'https://www.tyco-fire.com/products-and-solutions';
const TH = 'https://www.tyco-fire.com/-/media/project/jci-global/fire-suppression/tyco-fire/tyco-fire/thumbnail/';
const PC = 'https://www.tyco-fire.com/-/media/project/jci-global/fire-suppression/tyco-fire/tyco-fire/home-page/product-card-images/';
const Q = '?la=en&h=250&w=347&hash=';
const IMG_VALVES = PC + 'bts_productcard_homepage_valves_devices_and_components.png' + Q + '9969C709CDC055F735E74B5A91CCC4B5';
const IMG_GROOVED = PC + 'bts_productcard_homepage_fire_grooved.png' + Q + 'FF1DFE4316BCA63290CFDAF5DAE8B6DB';
const IMG_ANTI = PC + 'bts_productcard_homepage_lfp_antifreeze.png' + Q + '8196A8855FFED1BC09837AEE3CDA376A';
const IMG_MLCS = PC + 'bts_productcard_homepage_mlc-s.png' + Q + '8F4D6D34ED2DBE7A4AD417391D2C8E55';
const IMG_PERF = PC + 'bts_productcard_homepage_performance_based_design.png' + Q + '4A592F7710ADD7F2C97BE05683982AAD';
const IMG_HOSE = PC + 'bts_productcard_homepage_flexible_hose.png' + Q + '104E8C3A23D109A92FCB133F9E808F6F';
const IMG_SPR = PC + 'bts_productcard_homepage_sprinklers_nozzles_and_accessories.png' + Q + '149404DD1C6B0E536B89CB7B176DB7CB';
const IMG_CORR = TH + 'bts_thumb_corrosion_solutions_istock-1140837591.jpg';

export const tycoCatalog: BrandCatalogCategory[] = [
  {
    name: 'Sprinklers, Nozzles & Accessories',
    slug: 'sprinklers-nozzles-and-accessories',
    iconName: 'warning',
    descriptionRu: 'Спринклеры и оросители для любых зон, опасностей и типов срабатывания',
    subcategories: [
      { name: 'Standard Coverage', url: `${B}/sprinklers-nozzles-and-accessories/standard-coverage`, thumbnailUrl: TH + 'bts_thumb_standard_coverage_stock-photo-id1038296672.jpg' },
      { name: 'Extended Coverage', url: `${B}/sprinklers-nozzles-and-accessories/extended-coverage`, thumbnailUrl: TH + 'bts_thumb_extended_coverage_stock-photo-id935563930.jpg' },
      { name: 'Storage', url: `${B}/sprinklers-nozzles-and-accessories/storage`, thumbnailUrl: TH + 'bts_thumb_storage_stock-photo-id1133945516.jpg' },
      { name: 'Residential', url: `${B}/sprinklers-nozzles-and-accessories/residential`, thumbnailUrl: TH + 'bts_thumb_residential_stock-photo-id91701060.jpg' },
      { name: 'Dry', url: `${B}/sprinklers-nozzles-and-accessories/dry`, thumbnailUrl: TH + 'bts_thumb_dry_stock-photo-id467871690.jpg' },
      { name: 'Special Application', url: `${B}/sprinklers-nozzles-and-accessories/special-application`, thumbnailUrl: TH + 'bts_thumb_special_application_stock-photo-id1167772332.jpg' },
      { name: 'Nozzles', url: `${B}/sprinklers-nozzles-and-accessories/nozzles`, thumbnailUrl: TH + 'bts_thumb_nozzels_stock-photo-id924931410.jpg' },
      { name: 'Sprinkler Accessories', url: `${B}/sprinklers-nozzles-and-accessories/sprinkler-accessories`, thumbnailUrl: TH + 'bts_thumb_sprinkler_accessories_stock-photo-id1207751779.jpg' },
    ],
  },
  {
    name: 'Valves, Devices & Components',
    slug: 'valves-devices-and-components',
    iconName: 'wrench',
    descriptionRu: 'Клапаны и узлы управления для мокрых, сухих и заливных систем',
    subcategories: [
      { name: 'Wet System Valves and Components', url: `${B}/valves-devices-and-components/wet-system-valves-and-components`, thumbnailUrl: IMG_VALVES },
      { name: 'Dry System Valves', url: `${B}/valves-devices-and-components/dry-system-valves`, thumbnailUrl: IMG_VALVES },
      { name: 'Deluge & Preaction Valves and Components', url: `${B}/valves-devices-and-components/deluge-and-preaction-valves-and-components`, thumbnailUrl: IMG_VALVES },
      { name: 'General Purpose Valves', url: `${B}/valves-devices-and-components/general-purpose-valves`, thumbnailUrl: IMG_VALVES },
      { name: 'Accelerators', url: `${B}/valves-devices-and-components/accelerators`, thumbnailUrl: IMG_VALVES },
      { name: 'Air Maintenance Devices', url: `${B}/valves-devices-and-components/air-maintenance-devices`, thumbnailUrl: IMG_VALVES },
      { name: 'System Components', url: `${B}/valves-devices-and-components/system-components`, thumbnailUrl: IMG_VALVES },
      { name: 'Fire Sprinkler Switches', url: `${B}/valves-devices-and-components/fire-sprinkler-switches`, thumbnailUrl: IMG_VALVES },
    ],
  },
  {
    name: 'Grooved Products',
    slug: 'grooved-products',
    iconName: 'package',
    descriptionRu: 'Муфты, фитинги и механические соединения для трубопроводов',
    subcategories: [
      { name: 'Fire Grooved', url: `${B}/grooved-products/fire-grooved`, thumbnailUrl: IMG_GROOVED },
      { name: 'Mechanical Grooved (Non-Fire)', url: `${B}/grooved-products/mechanical-grooved`, thumbnailUrl: IMG_GROOVED },
    ],
  },
  {
    name: 'Corrosion Solutions',
    slug: 'corrosion-solutions',
    iconName: 'shield',
    descriptionRu: 'Азотные генераторы и аксессуары для защиты систем от коррозии',
    subcategories: [
      { name: 'Nitrogen Generators', url: `${B}/corrosion-solutions/nitrogen-generators`, thumbnailUrl: IMG_CORR },
      { name: 'Nitrogen Accessories', url: `${B}/corrosion-solutions/nitrogen-accessories`, thumbnailUrl: IMG_CORR },
    ],
  },
  {
    name: 'MLC-S Pipe System',
    slug: 'mlc-s-pipe-system',
    iconName: 'package',
    descriptionRu: 'Композитная трубопроводная система для спринклерных потолков',
    subcategories: [
      { name: 'MLC-S Pipes', url: `${B}/mlc-s-pipe-system/mlcs_pipes_fsp`, thumbnailUrl: IMG_MLCS },
      { name: 'MLC-S Fittings', url: `${B}/mlc-s-pipe-system/mlcs_fittings_fsp`, thumbnailUrl: IMG_MLCS },
      { name: 'MLC-S Casting Cup', url: `${B}/mlc-s-pipe-system/mlcs_casting_cup_fsp`, thumbnailUrl: IMG_MLCS },
      { name: 'MLC-S Tools', url: `${B}/mlc-s-pipe-system/mlcs_tools_fsp`, thumbnailUrl: IMG_MLCS },
    ],
  },
  {
    name: 'Antifreeze',
    slug: 'antifreeze',
    iconName: 'warning',
    descriptionRu: 'Антифризы для спринклерных систем, включая UL-listed LFP®',
    subcategories: [
      { name: 'LFP® Antifreeze', url: `${B}/antifreeze/lfp_antifreeze_fsp`, thumbnailUrl: IMG_ANTI },
      { name: 'All Antifreeze', url: `${B}/antifreeze`, thumbnailUrl: IMG_ANTI },
    ],
  },
  {
    name: 'Stainless Steel Systems',
    slug: 'stainless-steel-systems',
    iconName: 'package',
    descriptionRu: 'Системы из нержавеющей стали для пожаротушения',
    subcategories: [
      { name: 'Stainless Steel System Products', url: `${B}/stainless-steel-systems/stainless-steel-systems`, thumbnailUrl: IMG_MLCS },
    ],
  },
  {
    name: 'Valves & Accessories',
    slug: 'valves-and-accessories',
    iconName: 'wrench',
    descriptionRu: 'Клапаны и сопутствующие компоненты',
    subcategories: [
      { name: 'Valves and Accessory Products', url: `${B}/valves-and-accessories/valves-and-accessories`, thumbnailUrl: IMG_VALVES },
    ],
  },
  {
    name: 'Flexible Hose Assemblies',
    slug: 'flexible-hose-assemblies-and-components',
    iconName: 'wrench',
    descriptionRu: 'Гибкие подводки и компоненты для спринклерных систем',
    subcategories: [
      { name: 'Flexible Hose Assemblies and Components', url: `${B}/flexible-hose-assemblies-and-components`, thumbnailUrl: IMG_HOSE },
    ],
  },
  {
    name: 'Performance Based Design',
    slug: 'performance-based-design',
    iconName: 'shield',
    descriptionRu: 'Инженерные решения под конкретный объект и условия эксплуатации',
    subcategories: [
      { name: 'Performance Based Design', url: `${B}/performance-based-design`, thumbnailUrl: IMG_PERF },
    ],
  },
  {
    name: 'Smart Prefabricated Solutions',
    slug: 'prefabricated-solutions',
    iconName: 'package',
    descriptionRu: 'Готовые преднабранные узлы для ускорения монтажа систем',
    subcategories: [
      { name: 'Smart Prefabricated Solutions', url: `${B}/prefabricated-solutions`, thumbnailUrl: IMG_SPR },
    ],
  },
];
