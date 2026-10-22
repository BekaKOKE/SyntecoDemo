import type { BrandConfig } from './types';
import { tycoCatalog } from './tyco-catalog';

export const tyco: BrandConfig = {
  slug: 'tyco',
  name: 'TYCO',
  legalName: 'Tyco Fire Products LP (Johnson Controls)',
  logoUrl: '/brands/tyco/logo.webp',
  website: 'https://www.tyco-fire.com',
  taglineRu: 'Спринклерные системы и оборудование автоматического пожаротушения',
  descriptionRu:
    'TYCO — бренд пожаротушения в составе Johnson Controls с отраслевым наследием почти 170 лет. Решения применяются для защиты коммерческих, промышленных, складских и специальных объектов.\n\nПортфель включает спринклеры и оросители, клапаны, трубные соединения, системы водяного, пенного и специального пожаротушения, а также готовые узлы для ускорения монтажа.',
  heroColor: '#1687C9',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,255,255,.20), transparent 25%), linear-gradient(135deg, #04121c 0%, #075786 52%, #1687c9 100%)',
  heroTextColor: 'light',
  established: 1850,
  country: 'США',
  certifications: ['UL Listed', 'FM Approved', 'NFPA', 'CE'],
  industries: ['Склады', 'Дата-центры', 'Промышленность', 'Коммерческие здания', 'Нефтегаз'],
  categories: [
    { name: 'Спринклеры и оросители', iconName: 'warning', url: 'https://www.tyco-fire.com/products-and-solutions/sprinklers-nozzles-and-accessories' },
    { name: 'Клапаны и узлы управления', iconName: 'wrench', url: 'https://www.tyco-fire.com/products-and-solutions/valves-devices-and-components' },
    { name: 'Муфты и фитинги', iconName: 'package', url: 'https://www.tyco-fire.com/products-and-solutions/grooved-products' },
    { name: 'Пенные системы', iconName: 'shield', url: 'https://www.ansul.com/foam-concentrates-and-equipment' },
    { name: 'Специальное пожаротушение', iconName: 'shield', url: 'https://www.tyco-fire.com/products-and-solutions' },
  ],
  productCatalog: tycoCatalog,
  featureBlocks: [
    { title: 'Полная система', text: 'Оросители, клапаны, фитинги и узлы подбираются в рамках единой архитектуры пожаротушения.' },
    { title: 'Разные риски', text: 'Линейки охватывают склады, морозильные камеры, производства и объекты с особыми опасностями.' },
    { title: 'Проектная поддержка', text: 'Документация и сертифицированные решения упрощают спецификацию и согласование проекта.' },
  ],
};
