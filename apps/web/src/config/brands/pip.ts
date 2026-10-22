import type { BrandConfig } from './types';
import { pipCatalog } from './pip-catalog';

export const pip: BrandConfig = {
  slug: 'pip',
  name: 'PIP Global',
  legalName: 'Protective Industrial Products, Inc.',
  logoUrl: '/brands/pip/logo.webp',
  website: 'https://pipglobal.com',
  taglineRu: 'Полный спектр средств индивидуальной защиты',
  descriptionRu: '',
  heroColor: '#D50000',
  heroTextColor: 'light',
  established: 1984,
  country: 'США',
  certifications: ['ANSI', 'EN 388', 'EN 407', 'EN 166'],
  industries: ['Промышленность', 'Строительство', 'Автосервис', 'Логистика'],
  categories: [
    { name: 'Перчатки', iconName: 'package', url: 'https://us.pipglobal.com/en/products/?scID=2560' },
    { name: 'СИЗ (очки, каски)', iconName: 'shield', url: 'https://us.pipglobal.com/en/products/?scID=2562' },
    { name: 'Спецодежда', iconName: 'shield', url: 'https://us.pipglobal.com/en/products/?scID=2563' },
    { name: 'Защита от падения', iconName: 'shield', url: 'https://us.pipglobal.com/en/products/?scID=2584' },
  ],
  productCatalog: pipCatalog,
};
