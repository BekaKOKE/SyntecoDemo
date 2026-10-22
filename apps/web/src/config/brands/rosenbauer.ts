import type { BrandConfig } from './types';
import { rosenbauerCatalog } from './rosenbauer-catalog';

export const rosenbauer: BrandConfig = {
  slug: 'rosenbauer',
  name: 'Rosenbauer',
  legalName: 'Rosenbauer International AG',
  logoUrl: '/brands/rosenbauer/logo.webp',
  website: 'https://www.rosenbauer.com',
  taglineRu: 'Пожарная техника, экипировка и цифровые решения для экстренных служб',
  descriptionRu:
    'Rosenbauer — австрийская группа с историей с 1866 года и штаб-квартирой в Леондинге. Компания разрабатывает решения для профессиональных, промышленных и добровольных пожарных подразделений.\n\nПортфель охватывает пожарные автомобили, насосы и системы пожаротушения, экипировку и СИЗ, технику для аэропортов, а также цифровые инструменты управления операциями.',
  heroColor: '#E30613',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,255,255,.18), transparent 25%), linear-gradient(135deg, #190204 0%, #67070c 52%, #e30613 100%)',
  heroTextColor: 'light',
  established: 1866,
  country: 'Австрия',
  certifications: ['EN 1846', 'EN 469', 'EN 443', 'NFPA'],
  industries: ['Пожарные службы', 'Аэропорты', 'Нефтегаз', 'Промышленность', 'Муниципальный сектор'],
  categories: [
    { name: 'Пожарные автомобили', iconName: 'bolt', url: 'https://www.rosenbauer.com/en/products/vehicles' },
    { name: 'Насосы и пожаротушение', iconName: 'warning', url: 'https://www.rosenbauer.com/en/products/fire-fighting-systems-and-body-components/mobile-extinguishing-systems' },
    { name: 'Защитная экипировка', iconName: 'shield', url: 'https://www.rosenbauer.com/en/products/equipment' },
    { name: 'Пожарные шлемы', iconName: 'shield', url: 'https://www.rosenbauer.com/en/products/equipment' },
    { name: 'Цифровые системы', iconName: 'package', url: 'https://www.rosenbauer.com/en/products' },
  ],
  productCatalog: rosenbauerCatalog,
  featureBlocks: [
    { title: 'Комплексная техника', text: 'Автомобили, насосы, стволы и оснащение проектируются как согласованная система.' },
    { title: 'Защита пожарного', text: 'Экипировка и СИЗ создаются с учётом реальных сценариев пожарно-спасательных работ.' },
    { title: 'Управление операциями', text: 'Цифровые решения помогают координировать технику, персонал и данные на месте происшествия.' },
  ],
};
