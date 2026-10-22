import type { BrandConfig } from './types';

export const armacell: BrandConfig = {
  slug: 'armacell',
  name: 'Armacell',
  legalName: 'Armacell International S.A.',
  logoUrl: '/brands/armacell/logo.webp',
  website: 'https://www.armacell.com',
  taglineRu: 'Техническая изоляция и инженерные пены для энергоэффективной инфраструктуры',
  descriptionRu:
    'Armacell разрабатывает гибкие изоляционные материалы и инженерные пены для оборудования, зданий и транспортной инфраструктуры. Современная компания была создана в 2000 году, а её промышленное наследие начинается с предприятия Armstrong, основанного в 1860 году.\n\nРешения бренда помогают контролировать конденсат, снижать тепловые потери, шум и риск коррозии под изоляцией в системах HVAC, холодоснабжения и технологических трубопроводах.',
  heroColor: '#69B42E',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,255,255,.20), transparent 25%), linear-gradient(135deg, #071612 0%, #174a36 50%, #69b42e 100%)',
  heroTextColor: 'light',
  established: 2000,
  country: 'Люксембург',
  certifications: ['EN 14304', 'ASTM C534', 'UL 94', 'ISO 9001'],
  industries: ['HVAC', 'Холодоснабжение', 'Нефтегаз', 'Строительство', 'Транспорт'],
  categories: [
    { name: 'Эластомерная изоляция', iconName: 'package', url: 'https://www.armacell.com' },
    { name: 'Тепло- и холодоизоляция', iconName: 'shield', url: 'https://www.armacell.com/en-GB/thermal-insulation' },
    { name: 'Акустические решения', iconName: 'warning', url: 'https://www.armacell.com/en-US/acoustic-solutions' },
    { name: 'Клеи и покрытия', iconName: 'wrench', url: 'https://www.armacell.com' },
    { name: 'Инженерные пены', iconName: 'package', url: 'https://www.armacell.com/en-US/engineered-foams' },
  ],
  featureBlocks: [
    { title: 'Контроль конденсата', text: 'Закрытоячеистая структура помогает защищать трубопроводы и оборудование от влаги.' },
    { title: 'Энергоэффективность', text: 'Изоляция сокращает тепловые потери и поддерживает расчётную температуру системы.' },
    { title: 'Комплексная система', text: 'Материалы, клеи, покрытия и аксессуары подбираются как единое техническое решение.' },
  ],
};
