import type { BrandConfig } from './types';
import { honeywellCatalog } from './honeywell-catalog';

export const honeywell: BrandConfig = {
  slug: 'honeywell',
  name: 'Honeywell',
  legalName: 'Honeywell International Inc.',
  logoUrl: '/brands/honeywell/logo.webp',
  website: 'https://sps.honeywell.com/us/en/products',
  taglineRu: 'Пожарная безопасность и СИЗ мирового уровня',
  descriptionRu: '', // Added later
  heroColor: '#FF0000',
  heroTextColor: 'light',
  established: 1906,
  country: 'США',
  certifications: ['ANSI Z87.1', 'ANSI Z89.1', 'NIOSH', 'CE', 'EN'],
  industries: ['Нефтегаз', 'Химия', 'Энергетика', 'Оборона'],
  categories: [
    { name: 'СИЗ (перчатки, очки, каски)', iconName: 'shield', url: 'https://automation.honeywell.com/us/en/products/personal-protective-equipment' },
    { name: 'Газоанализаторы', iconName: 'warning', url: 'https://automation.honeywell.com/us/en/products/sensing-solutions/gas-and-flame-detection' },
    { name: 'Пожарная сигнализация', iconName: 'bolt', url: 'https://buildings.honeywell.com/us/en/solutions/fire' },
    { name: 'Сварочные шлемы', iconName: 'wrench', url: 'https://automation.honeywell.com/us/en/products/personal-protective-equipment/face-protection' },
  ],
  productCatalog: honeywellCatalog,
};

