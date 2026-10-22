import type { BrandConfig } from './types';
import { sataCatalog } from './sata-catalog';

export const sata: BrandConfig = {
  slug: 'sata',
  name: 'SATA',
  legalName: 'SATA GmbH & Co. KG',
  logoUrl: '/brands/sata/logo.webp',
  website: 'https://www.sata.com/en/',
  taglineRu: 'Профессиональные окрасочные системы и подготовка сжатого воздуха',
  descriptionRu:
    'История немецкой SATA начинается в 1907 году с компании Sanitaria GmbH. Сегодня бренд специализируется на технологиях нанесения жидких лакокрасочных материалов и поставляет продукцию примерно в 100 стран.\n\nОсновные направления — краскопульты, бачки и системы подачи материала, фильтрация и подготовка сжатого воздуха, а также средства дыхательной защиты для окрасочных работ.',
  heroColor: '#0B6B47',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,255,255,.18), transparent 25%), linear-gradient(135deg, #04120d 0%, #0b422e 50%, #0b6b47 100%)',
  heroTextColor: 'light',
  established: 1907,
  country: 'Германия',
  certifications: ['CE', 'ATEX', 'ISO 9001', 'DIN EN 12021'],
  industries: ['Авторемонт', 'Промышленная окраска', 'Деревообработка', 'Судостроение', 'Производство'],
  categories: [
    { name: 'Краскопульты', iconName: 'wrench', url: 'https://www.sata.com/en/spray-guns/' },
    { name: 'Системы бачков', iconName: 'package', url: 'https://www.sata.com/en/cup-systems/' },
    { name: 'Подготовка воздуха', iconName: 'shield', url: 'https://www.sata.com/en/filter-technology/' },
    { name: 'Дыхательная защита', iconName: 'shield', url: 'https://www.sata.com/en/respiratory-protection/' },
    { name: 'Аксессуары и сервис', iconName: 'wrench', url: 'https://www.sata.com/en/' },
  ],
  productCatalog: sataCatalog,
  featureBlocks: [
    { title: 'Точная атомизация', text: 'Окрасочные системы рассчитаны на стабильный факел и воспроизводимое качество покрытия.' },
    { title: 'Чистый воздух', text: 'Фильтры и регуляторы подготавливают сжатый воздух для окраски и дыхательных систем.' },
    { title: 'Сервисная система', text: 'Сменные компоненты и аксессуары помогают поддерживать оборудование в рабочем состоянии.' },
  ],
};
