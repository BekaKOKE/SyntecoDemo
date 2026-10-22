import type { BrandCatalogCategory } from './types';

/**
 * Rosenbauer product catalog mirroring the official rosenbauer.com taxonomy.
 * Source: https://www.rosenbauer.com/en/products
 *
 * Full-range fire-service system supplier. Links point to the official product
 * sections, with official Rosenbauer product images.
 */
const B = 'https://www.rosenbauer.com/en/products';
const R = 'https://www.rosenbauer.com';

export const rosenbauerCatalog: BrandCatalogCategory[] = [
  {
    name: 'Vehicles',
    slug: 'vehicles',
    iconName: 'warning',
    descriptionRu: 'Пожарные автомобили: муниципальные, автолестницы, аэродромные, промышленные и электрические',
    subcategories: [
      { name: 'All Vehicles', url: `${B}/vehicles`, thumbnailUrl: R + '/cache-buster-4/Products/Vehicles/Pumpers/AT/1336/image-thumb__1336__card/rosenbauer-pumpers-at-353571.b0a34b3a.webp' },
    ],
  },
  {
    name: 'Equipment',
    slug: 'equipment',
    iconName: 'shield',
    descriptionRu: 'Экипировка и снаряжение: СИЗ пожарного, техническое и специальное оборудование',
    subcategories: [
      { name: 'Firefighting Equipment', url: `${B}/equipment`, thumbnailUrl: R + '/cache-buster-4/Products/Equipment/Firefighting%20Helmets/HEROS%20Titan/1136/image-thumb__1136__card/rosenbauer-firefighting-helmet-heros-titan_card_337961.95a5c01e.webp' },
      { name: 'Other Equipment Products', url: `${B}/equipment/other-equipment-products`, thumbnailUrl: R + '/Products/Equipment/Other%20Equipment%20Products/3617/image-thumb__3617__socialThumb/rosenbauer-other-equipment-295474.a515d438.jpg' },
    ],
  },
  {
    name: 'Fire-fighting Systems & Body Components',
    slug: 'fire-fighting-systems-and-body-components',
    iconName: 'wrench',
    descriptionRu: 'Насосы, кузовные компоненты, мобильные и проникающие системы пожаротушения',
    subcategories: [
      { name: 'Mobile Extinguishing Systems', url: `${B}/fire-fighting-systems-and-body-components/mobile-extinguishing-systems`, thumbnailUrl: R + '/cache-buster-5/Products/Extinguishing%20Systems%20%26%20Body%20Components/Mobile%20Firefighting%20Systems/Portable%20Pumps/FOX/2764/image-thumb__2764__card/rosenbauer-portable%20pumps_fox_365328_small.83232b48.webp' },
      { name: 'Body Components', url: `${B}/fire-fighting-systems-and-body-components/body-components`, thumbnailUrl: R + '/cache-buster-5/Products/Extinguishing%20Systems%20%26%20Body%20Components/Body%20Components/Rapid%20intervention%20hose%20reel/1371/image-thumb__1371__card/rosenbauer-components-rapid-intervention-hose-reel-349415.ab324218.webp' },
      { name: 'Penetrating Extinguishing Systems', url: `${B}/fire-fighting-systems-and-body-components/penetrating-extinguishing-systems`, thumbnailUrl: R + '/cache-buster-5/Products/Extinguishing%20Systems%20%26%20Body%20Components/Penetrating%20Firefighting%20Systems/RFC%20CUTTEX/1755/image-thumb__1755__card/rosenbauer-penetrating-extinguishing-systems-rfc-cuttex-357597.27d714d2.webp' },
    ],
  },
];
