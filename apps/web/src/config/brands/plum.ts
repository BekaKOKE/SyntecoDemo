import type { BrandConfig } from './types';
import { plumCatalog } from './plum-catalog';

export const plum: BrandConfig = {
  slug: 'plum',
  name: 'Plum Safety',
  legalName: 'Plum Safety ApS',
  logoUrl: '/brands/plum/logo.webp',
  website: 'https://plum.eu/',
  taglineRu: 'Первая помощь, промывание глаз и обработка травм на рабочем месте',
  descriptionRu:
    'Plum Safety — датский производитель решений первой помощи с традицией, берущей начало в 1860 году. Компания находится в Ассенсе и более полувека развивает продукты для быстрой помощи непосредственно на рабочем месте.\n\nАссортимент включает станции и флаконы для промывания глаз, пластыри, средства для ран и ожогов, перевязочные материалы и решения для химической деконтаминации.',
  heroColor: '#5A626B',
  heroGradient:
    'radial-gradient(circle at 82% 18%, rgba(255,255,255,.17), transparent 25%), linear-gradient(135deg, #08090b 0%, #25292e 52%, #5a626b 100%)',
  heroTextColor: 'light',
  established: 1860,
  country: 'Дания',
  certifications: ['CE', 'EN 15154-4', 'DIN 13157', 'ISO 13485'],
  industries: ['Производство', 'Химия', 'Лаборатории', 'Строительство', 'Пищевая отрасль'],
  categories: [
    { name: 'Промывание глаз', iconName: 'shield', url: 'https://plum.eu/wound-and-eyewash/' },
    { name: 'Станции первой помощи', iconName: 'package', url: 'https://plum.eu/first-aid-stations/' },
    { name: 'Пластыри и перевязка', iconName: 'package', url: 'https://plum.eu/plasters/' },
    { name: 'Помощь при ожогах', iconName: 'warning', url: 'https://plum.eu/refills-for-first-aid/plum-quickcool/' },
    { name: 'Деконтаминация', iconName: 'shield', url: 'https://plum.eu/decontamination/' },
  ],
  productCatalog: plumCatalog,
  featureBlocks: [
    { title: 'Помощь рядом', text: 'Настенные станции размещают необходимые средства прямо в зоне риска.' },
    { title: 'Промывание глаз', text: 'Флаконы и станции рассчитаны на быстрое начало промывания после инцидента.' },
    { title: 'Понятная комплектация', text: 'Модульные решения упрощают контроль расходников и пополнение аптечек.' },
  ],
};
