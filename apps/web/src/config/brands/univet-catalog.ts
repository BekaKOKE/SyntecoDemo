import type { BrandCatalogCategory } from './types';

/**
 * Univet product catalog mirroring the official univetsafety.com taxonomy.
 * Source: https://www.univetsafety.com/en/products/safety/
 *
 * Product families (Spectacles, Goggles, Face Shields) with their variants,
 * plus prescription, laser, medical/cleanroom and product care. Direct links
 * and official Univet images.
 */
const UF = 'https://www.univetsafety.com/site/assets/files/';
const SPEC = UF + '18263/header_506up.640x0.jpg';
const CONTEMP = UF + '6412/immagine_full_screen_contemporary.640x0.jpg';
const GOG = UF + '18265/header_625-1.640x0.jpg';
const FACE = UF + '5662/605.640x640.jpg';
const PRESC = UF + '9662/header_contemporary_1_mobile_copia.jpg';
const MED = UF + '9424/5x7-med-indossato_copia-1.1920x0.jpg';
const CLEAN = UF + '7697/header_clean_room_def.1920x0.jpg';
const CARE = UF + '7543/cleaning-wipes_black_bkg_2000x1200-1.640x640.jpg';
const LASER = 'https://www.univetlaser.com/site/assets/files/6413/header_eye-protection_mobile-1.jpg';

export const univetCatalog: BrandCatalogCategory[] = [
  {
    name: 'Spectacles',
    slug: 'spectacles',
    iconName: 'shield',
    descriptionRu: 'Защитные очки со спортивным дизайном для промышленности, сварки и ИК-защиты',
    subcategories: [
      { name: 'Industrial Spectacles', url: 'https://www.univetsafety.com/en/products/safety/spectacles/', thumbnailUrl: SPEC },
      { name: 'Welding Spectacles', url: 'https://www.univetsafety.com/en/search/safety/?a=4835&s=1077', thumbnailUrl: SPEC },
      { name: 'IR Spectacles', url: 'https://www.univetsafety.com/en/search/safety/?a=9837&s=1077', thumbnailUrl: SPEC },
      { name: 'Contemporary (Fashion)', url: 'https://www.univetsafety.com/en/products/safety/spectacles/contemporary/', thumbnailUrl: CONTEMP },
      { name: 'Medical Spectacles', url: 'https://www.univetsafety.com/en/products/medical/spectacles/', thumbnailUrl: MED },
    ],
  },
  {
    name: 'Goggles',
    slug: 'goggles',
    iconName: 'shield',
    descriptionRu: 'Закрытые очки с широким полем обзора и превосходной ударопрочностью',
    subcategories: [
      { name: 'Industrial Goggles', url: 'https://www.univetsafety.com/en/products/safety/goggles/', thumbnailUrl: GOG },
      { name: 'Welding Goggles', url: 'https://www.univetsafety.com/en/search/safety/?a=4835&s=1615', thumbnailUrl: GOG },
      { name: 'Medical Goggles', url: 'https://www.univetsafety.com/en/products/medical/goggles/', thumbnailUrl: MED },
      { name: 'Cleanroom Goggles', url: 'https://www.univetsafety.com/en/products/cleanroom/goggles/', thumbnailUrl: CLEAN },
    ],
  },
  {
    name: 'Face Shields',
    slug: 'face-shields',
    iconName: 'shield',
    descriptionRu: 'Лицевые щитки для защиты всего лица в промышленности, сварке и ИК-условиях',
    subcategories: [
      { name: 'Industrial Face Shields', url: 'https://www.univetsafety.com/en/products/safety/faceshields/', thumbnailUrl: FACE },
      { name: 'Welding Face Shields', url: 'https://www.univetsafety.com/en/search/safety/?a=4835&s=1641', thumbnailUrl: FACE },
      { name: 'IR Face Shields', url: 'https://www.univetsafety.com/en/search/safety/?a=9837&s=1641', thumbnailUrl: FACE },
      { name: 'Medical Face Shields', url: 'https://www.univetsafety.com/en/products/medical/face-shields/', thumbnailUrl: MED },
    ],
  },
  {
    name: 'Prescription Glasses',
    slug: 'prescription-glasses',
    iconName: 'package',
    descriptionRu: 'Корригирующие защитные очки с диоптриями',
    subcategories: [
      { name: 'Prescription Safety Eyewear', url: 'https://www.univetsafety.com/en/products/prescription-safety/', thumbnailUrl: PRESC },
    ],
  },
  {
    name: 'Laser Protection',
    slug: 'laser-protection',
    iconName: 'warning',
    descriptionRu: 'Очки для защиты глаз от лазерного и импульсного излучения',
    subcategories: [
      { name: 'Laser Eye Protection', url: 'https://www.univetlaser.com/en/products/laser-eye-protection/', thumbnailUrl: LASER },
    ],
  },
  {
    name: 'Medical & Cleanroom',
    slug: 'medical-cleanroom',
    iconName: 'package',
    descriptionRu: 'Оптика для медицины и решения для чистых помещений',
    subcategories: [
      { name: 'Medical', url: 'https://www.univetsafety.com/en/products/medical/', thumbnailUrl: MED },
      { name: 'Cleanroom', url: 'https://www.univetsafety.com/en/products/cleanroom/', thumbnailUrl: CLEAN },
    ],
  },
  {
    name: 'Product Care',
    slug: 'product-care',
    iconName: 'wrench',
    descriptionRu: 'Средства ухода: наборы для чистки, чехлы и шнурки',
    subcategories: [
      { name: 'Cleaning Kits, Cases & Cords', url: 'https://www.univetsafety.com/en/products/product-care/cleaning-kits-cases-cords/', thumbnailUrl: CARE },
    ],
  },
];
