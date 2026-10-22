import type { BrandConfig } from './types';
import { heinzGlasCatalog } from './heinz-glas-catalog';

export const heinzGlas: BrandConfig = {
  slug: 'heinz-glas',
  name: 'HEINZ-GLAS',
  legalName: 'HEINZ-GLAS GmbH & Co. KGaA',
  logoUrl: '/brands/heinz-glas/logo.webp',
  website: 'https://heinz-glas.com/en/',
  taglineRu: 'Премиальная стеклянная упаковка для парфюмерии и косметики',
  descriptionRu:
    'HEINZ-GLAS — семейная немецкая группа с историей компании с 1622 года и традицией стеклоделия семьи Heinz с 1523 года. Производитель специализируется на флаконах, банках, крышках и комплексной упаковке для парфюмерной и косметической индустрии.\n\nВнутри группы объединены разработка дизайна, изготовление пресс-форм, производство стекла и декоративная отделка: матирование, окрашивание, металлизация, лазерная обработка, тампонная и трафаретная печать.',
  heroColor: '#E7B600',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,215,64,.26), transparent 26%), linear-gradient(135deg, #090a0c 0%, #292b2f 55%, #8a6900 100%)',
  heroTextColor: 'light',
  established: 1622,
  country: 'Германия',
  certifications: ['ISO 9001', 'ISO 14001', 'ISO 15378', 'BRCGS Packaging'],
  industries: ['Парфюмерия', 'Косметика', 'Фармацевтика', 'Премиальная упаковка'],
  categories: [
    { name: 'Парфюмерные флаконы', iconName: 'package', url: 'https://heinz-glas.com/en/products/glass/glass-types/perfume' },
    { name: 'Косметические банки', iconName: 'package', url: 'https://heinz-glas.com/en/products/glass/glass-types/skin-care' },
    { name: 'Стеклянные крышки', iconName: 'shield', url: 'https://heinz-glas.com/en/products/glass/glass-types/glass-caps' },
    { name: 'Декорирование', iconName: 'wrench', url: 'https://heinz-glas.com/en/products/decorations' },
    { name: 'Индивидуальная разработка', iconName: 'wrench', url: 'https://heinz-glas.com/en/products/customized-solutions' },
  ],
  productCatalog: heinzGlasCatalog,
  featureBlocks: [
    { title: 'Полный цикл', text: 'От идеи и формы до серийного производства, декора и готового упаковочного решения.' },
    { title: 'Гибкость производства', text: 'Стандартные и индивидуальные изделия выпускаются как крупными, так и небольшими сериями.' },
    { title: '400+ лет опыта', text: 'Семейная традиция и современные технологии объединены в международной производственной сети.' },
  ],
};
