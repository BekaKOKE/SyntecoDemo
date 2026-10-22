import type { BrandConfig } from './types';
import { threeMCatalog } from './three-m-catalog';

export const threeM: BrandConfig = {
  slug: '3m',
  name: '3M',
  legalName: '3M Company',
  logoUrl: '/brands/3m/logo.webp',
  website: 'https://www.3m.com/3M/en_US/p/',
  taglineRu: 'Наука, материалы и СИЗ для промышленности',
  descriptionRu:
    '3M производит промышленные материалы, абразивы, клеевые системы, ленты, фильтрационные решения и средства индивидуальной защиты для производства, строительства, энергетики, транспорта и медицины. Каталог ниже повторяет официальную структуру 3M: слева выбирается направление, справа открываются подкатегории с изображениями и ссылками на сайт производителя.',
  heroColor: '#FF0000',
  heroGradient: 'linear-gradient(135deg, #c90000 0%, #ff1f1f 48%, #5a0505 100%)',
  heroTextColor: 'light',
  established: 1902,
  country: 'США',
  certifications: ['NIOSH', 'ANSI', 'EN 149', 'CE', 'ГОСТ'],
  industries: [
    'Промышленность',
    'Строительство',
    'Нефтегаз',
    'Автосервис',
    'Электроника',
    'Медицина',
  ],
  categories: [
    { name: 'Абразивы', iconName: 'package', url: 'https://www.3m.com/3M/en_US/p/c/abrasives/' },
    { name: 'Клеи, герметики и наполнители', iconName: 'package', url: 'https://www.3m.com/3M/en_US/p/c/adhesives/' },
    { name: 'Средства индивидуальной защиты', iconName: 'shield', url: 'https://www.3m.com/3M/en_US/p/c/ppe/' },
    { name: 'Промышленные ленты', iconName: 'package', url: 'https://www.3m.com/3M/en_US/p/c/tapes/' },
    { name: 'Инструменты и оборудование', iconName: 'wrench', url: 'https://www.3m.com/3M/en_US/p/c/tools-equipment/' },
  ],
  productCatalog: threeMCatalog,
  featureBlocks: [
    {
      title: 'Официальная структура 3M',
      text: 'Разделы и подкатегории ведут на страницы официального каталога 3M, чтобы быстро сверять номенклатуру и характеристики.',
    },
    {
      title: 'Поставка под проект',
      text: 'Synteco помогает подобрать аналоги, проверить доступность и подготовить коммерческое предложение под задачу закупки.',
    },
  ],
};
