import type { BrandConfig } from './types';
import { ansulCatalog } from './ansul-catalog';

export const ansul: BrandConfig = {
  slug: 'ansul',
  name: 'Ansul',
  legalName: 'ANSUL (Johnson Controls)',
  logoUrl: '/brands/ansul/logo.webp',
  website: 'https://www.ansul.com',
  taglineRu: 'Профессиональные системы пожаротушения для специальных рисков',
  descriptionRu:
    'ANSUL разрабатывает комплексные решения для обнаружения и тушения пожаров на промышленных объектах, профессиональных кухнях, транспорте и объектах с критически важным оборудованием. В портфель входят пенные и газовые системы, сухие химические установки, переносные огнетушители, средства локализации разливов, а также системы управления и активации. Каталог ниже повторяет актуальную структуру Products & Solutions на официальном сайте производителя.',
  heroColor: '#003DA5',
  heroTextColor: 'light',
  established: 1914,
  country: 'США',
  certifications: ['UL', 'ULC', 'EN 3', 'CE', 'ТР ТС 012'],
  industries: ['Нефтегаз', 'HoReCa', 'Энергетика', 'Промышленность', 'Транспорт', 'ЦОД'],
  categories: [
    { name: 'Пенные концентраты и оборудование', iconName: 'package', url: 'https://www.ansul.com/foam-concentrates-and-equipment' },
    { name: 'Промышленные системы', iconName: 'warning', url: 'https://www.ansul.com/industrial-fire-supression-systems' },
    { name: 'Газовое пожаротушение', iconName: 'shield', url: 'https://www.ansul.com/gaseous-suppression-agent-releasing' },
    { name: 'Огнетушители и локализация разливов', iconName: 'warning', url: 'https://www.ansul.com/portable-fire-extinguishers-and-spill-control-products' },
    { name: 'Ресторанные системы', iconName: 'shield', url: 'https://www.ansul.com/restaurant-systems' },
    { name: 'Системы для транспорта', iconName: 'wrench', url: 'https://www.ansul.com/vehicle-fire-protection-systems' },
  ],
  productCatalog: ansulCatalog,
  featureBlocks: [
    {
      title: 'Решения для специальных рисков',
      text: 'Системы ANSUL подбираются под тип пожарной нагрузки, защищаемое оборудование, условия эксплуатации и требования конкретного объекта.',
    },
    {
      title: 'Официальная структура каталога',
      text: 'Каждая карточка содержит изображение производителя и ведет напрямую в соответствующий раздел официального сайта ANSUL.',
    },
  ],
};
