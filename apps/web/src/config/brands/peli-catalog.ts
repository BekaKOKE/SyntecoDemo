import type { BrandCatalogCategory } from './types';

/**
 * Peli (Pelican) product catalog mirroring the official peli.com/eu/en taxonomy.
 * Source: https://www.peli.com/eu/en/products/
 *
 * Every tile uses an official Peli image (navbar case thumbnails and product
 * images from media.peli.com) and links directly to the official range.
 */
const NAV = (name: string) => `https://media.peli.com/img/navbar/${name}.jpg`;
const P = 'https://media.peli.com/img/products/';

export const peliCatalog: BrandCatalogCategory[] = [
  {
    name: 'Cases',
    slug: 'cases',
    iconName: 'package',
    descriptionRu: 'Защитные кейсы: серии Protector, Air, Storm, Vault и специализированные решения',
    subcategories: [
      { name: 'Protector Cases', url: 'https://www.peli.com/eu/en/products/cases/protector-cases', thumbnailUrl: NAV('protector-cases') },
      { name: 'Air Cases', url: 'https://www.peli.com/eu/en/products/cases/air-cases', thumbnailUrl: NAV('air-cases') },
      { name: 'Storm Cases', url: 'https://www.peli.com/eu/en/products/cases/storm-cases', thumbnailUrl: NAV('storm-cases') },
      { name: 'Vault Cases', url: 'https://www.peli.com/eu/en/products/cases/vault-cases', thumbnailUrl: NAV('vault-cases') },
      { name: 'Personal Utility Cases', url: 'https://www.peli.com/eu/en/products/cases/personal-utility-cases', thumbnailUrl: NAV('personal-utility-cases') },
      { name: 'Micro Cases', url: 'https://www.peli.com/eu/en/products/cases/micro-cases', thumbnailUrl: NAV('micro-cases') },
      { name: 'Camera Cases', url: 'https://www.peli.com/eu/en/products/cases/camera-cases', thumbnailUrl: NAV('camera-cases') },
      { name: 'Travel Cases', url: 'https://www.peli.com/eu/en/products/cases/travel-cases', thumbnailUrl: NAV('travel-cases') },
      { name: 'Case Accessories', url: 'https://www.peli.com/eu/en/discover/case-accessories/', thumbnailUrl: NAV('accessories-cases') },
      { name: 'Rack Mount Cases', url: 'https://www.peli.com/eu/en/professional/rack-mount-cases/', thumbnailUrl: NAV('organizer-cases') },
      { name: 'Large Containers', url: 'https://www.peli.com/eu/en/professional/single-lid-case-sizes', thumbnailUrl: NAV('large-cases') },
    ],
  },
  {
    name: 'Torches',
    slug: 'torches',
    iconName: 'shield',
    descriptionRu: 'Профессиональные фонари: тактические, ATEX, налобные и угловые',
    subcategories: [
      { name: 'Tactical Torches', url: 'https://www.peli.com/eu/en/products/flashlights/tactical-flashlights', thumbnailUrl: P + 'flashlights/2350/peli-2350-led-tactical-gun-weapon-torch-t.jpg' },
      { name: 'ATEX Lights', url: 'https://www.peli.com/eu/en/products/flashlights/atex-lights', thumbnailUrl: P + 'flashlights/1930Z0/peli-zone-0-waterproof-safety-torch-t.jpg' },
      { name: 'Right Angle Lights', url: 'https://www.peli.com/eu/en/products/flashlights/right-angle-lights', thumbnailUrl: P + 'flashlights/3415Z0/peli-atex-safety-flashlight-3410z0-zone-0-t.jpg' },
      { name: 'Headlamps', url: 'https://www.peli.com/eu/en/products/flashlights/headlamps', thumbnailUrl: P + 'flashlights/2610Z0/peli-products-2610z0-atex-safety-headlamp-t.jpg' },
      { name: 'Remote Area Lights', url: 'https://www.peli.com/eu/en/products/remote-area-lights/', thumbnailUrl: P + 'rals/9750/9750_PELI_YELLOW_ANGLE_LIGHT_TALL-t.jpg' },
      { name: 'Industrial Torches', url: 'https://www.peli.com/eu/en/products/flashlights/industrial-torches', thumbnailUrl: P + 'flashlights/1910/peli-1910-super-bright-led-pen-torch-t.jpg' },
      { name: 'Torch Accessories', url: 'https://www.peli.com/eu/en/accessories/flashlights/', thumbnailUrl: P + 'flashlights/2350/peli-2350-led-tactical-gun-weapon-torch-t.jpg' },
    ],
  },
  {
    name: 'Luggage & Coolers',
    slug: 'luggage-coolers',
    iconName: 'package',
    descriptionRu: 'Прочные чемоданы для перевозки и термоконтейнеры',
    subcategories: [
      { name: 'Luggage', url: 'https://www.peli.com/eu/en/products/travel/', thumbnailUrl: P + 'travel/HC22/2026_Peli_TRVL_Small_LunarWhite_Handle-t.jpg' },
      { name: 'Coolers', url: 'https://www.peli.com/eu/en/products/coolers/', thumbnailUrl: P + 'cooler/8QT/pelican-8qt-hard-cooler-dark-gray-green-t.jpg' },
      { name: "What's New", url: 'https://www.peli.com/eu/en/shop/whats-new/', thumbnailUrl: P + 'travel/HC22/2026_Peli_TRVL_Small_LunarWhite_Handle-t.jpg' },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    iconName: 'wrench',
    descriptionRu: 'Аксессуары для кейсов и фонарей, чехлы для телефонов и повседневные решения',
    subcategories: [
      { name: 'Case Accessories', url: 'https://www.peli.com/eu/en/discover/case-accessories', thumbnailUrl: NAV('accessories-cases') },
      { name: 'Light Accessories', url: 'https://www.peli.com/eu/en/accessories/flashlights', thumbnailUrl: P + 'flashlights/1910/peli-1910-super-bright-led-pen-torch-t.jpg' },
      { name: 'Mobile', url: 'https://www.peli.com/eu/en/products/phone-cases-and-accessories/', thumbnailUrl: P + 'mobile/PL055684/peli-pl055684-waterproof-pouch-large-01-t.jpg' },
      { name: 'Essentials', url: 'https://www.peli.com/eu/en/products/essentials', thumbnailUrl: P + 'essentials/CRD_POU_001/crd-pouch-sm-01-t.jpg' },
    ],
  },
  {
    name: 'Business Solutions',
    slug: 'business-solutions',
    iconName: 'lock',
    descriptionRu: 'Отраслевые и заказные решения: стойки, контейнеры, военные и промышленные кейсы',
    subcategories: [
      { name: 'Rack Mount Cases', url: 'https://www.peli.com/eu/en/professional/rack-mount-cases/', thumbnailUrl: 'https://media.peli.com/img/professional/rack-mount-cases/pelican-military-rack-case-container-features.png' },
      { name: 'Large Containers', url: 'https://www.peli.com/eu/en/professional/single-lid-cases/', thumbnailUrl: P + 'isp/EU080060-4010-BLK-032/peli-eu080060-4010-blk-032-shipping-case-t.jpg' },
      { name: 'Euro Pallet Containers', url: 'https://www.peli.com/eu/en/products/isp-cases/', thumbnailUrl: P + 'isp/EU080060-4010-BLK-032/peli-eu080060-4010-blk-032-shipping-case-t.jpg' },
      { name: 'Mobile Military Cases', url: 'https://www.peli.com/eu/en/products/mobile-military-cases/', thumbnailUrl: P + 'mobilemilitary/472-RADIO-CHRG2BLK/472-RADIO-CHRG2BLK-charger-case-t.jpg' },
      { name: 'Remote Area Lights', url: 'https://www.peli.com/eu/en/products/remote-area-lights/', thumbnailUrl: P + 'rals/9750/9750_PELI_YELLOW_ANGLE_LIGHT_TALL-t.jpg' },
      { name: 'Custom Cases', url: 'https://www.peli.com/eu/en/professional/custom-cases/', thumbnailUrl: 'https://media.peli.com/img/professional/rack-mount-cases/pelican-military-rack-case-container-features.png' },
    ],
  },
];
