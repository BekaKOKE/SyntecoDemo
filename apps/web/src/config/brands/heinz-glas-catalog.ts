import type { BrandCatalogCategory } from './types';

/**
 * HEINZ-GLAS product catalog mirroring the official heinz-glas.com taxonomy.
 * Source: https://heinz-glas.com/en/products/glass
 *
 * Direct links to the standard glass collections and product programmes, with
 * official HEINZ-GLAS product images.
 */
const B = 'https://heinz-glas.com/en/products';
const U = 'https://heinz-glas.com/fileadmin/user_upload/';

export const heinzGlasCatalog: BrandCatalogCategory[] = [
  {
    name: 'Glass',
    slug: 'glass',
    iconName: 'package',
    descriptionRu: 'Стандартная коллекция стекла: флаконы и банки для парфюмерии и косметики',
    subcategories: [
      { name: 'Glass Caps', url: `${B}/glass/glass-types/glass-caps`, thumbnailUrl: U + 'cyindrical_iso_web.png' },
      { name: 'Color Cosmetic', url: `${B}/glass/glass-types/cosmetic`, thumbnailUrl: U + 'A4O-complete_2_Make-Up.png' },
      { name: 'Home Fragrance', url: `${B}/glass/glass-types/home-fragrance`, thumbnailUrl: U + 'A4O-complete_4_Home-Fragrance.png' },
      { name: 'Fragrance', url: `${B}/glass/glass-types/perfume`, thumbnailUrl: U + '_0058_Alex-50-ml---HD12843_ISO_HP6058.png' },
      { name: 'Skin Care', url: `${B}/glass/glass-types/skin-care`, thumbnailUrl: U + 'AIR_30ml_F1168_ISO_edit.png' },
      { name: 'All Standards', url: `${B}/glass/glass-types/alle-standards`, thumbnailUrl: U + 'cyindrical_iso_web.png' },
    ],
  },
  {
    name: 'Plastics',
    slug: 'plastics',
    iconName: 'package',
    descriptionRu: 'Пластиковые компоненты и решения для упаковки',
    subcategories: [
      { name: 'All Plastics', url: `${B}/plastics`, thumbnailUrl: U + 'PS_Glass_Kopie_edit.png' },
    ],
  },
  {
    name: 'Decorations',
    slug: 'decorations',
    iconName: 'wrench',
    descriptionRu: 'Декорирование и отделка стеклянной упаковки',
    subcategories: [
      { name: 'All Decorations', url: `${B}/decorations`, thumbnailUrl: U + 'Headerbilder/header-roll-decorations.jpg' },
    ],
  },
  {
    name: 'Innovations',
    slug: 'innovations',
    iconName: 'shield',
    descriptionRu: 'Инновационные разработки и устойчивые решения',
    subcategories: [
      { name: 'All Innovations', url: `${B}/innovations`, thumbnailUrl: U + 'pure_answer_detail.jpg' },
    ],
  },
  {
    name: 'Customized Solutions',
    slug: 'customized-solutions',
    iconName: 'wrench',
    descriptionRu: 'Индивидуальная разработка флаконов под задачу клиента',
    subcategories: [
      { name: 'Customized Solutions', url: `${B}/customized-solutions`, thumbnailUrl: U + 'Headerbilder/header-roll-products-customized-solutions.jpg' },
    ],
  },
];
