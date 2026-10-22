import type { BrandConfig } from './types';
import { masterLockCatalog } from './master-lock-catalog';

export const masterLock: BrandConfig = {
  slug: 'master-lock',
  name: 'Master Lock',
  legalName: 'Master Lock Company LLC',
  logoUrl: '/brands/master-lock/logo.webp',
  website: 'https://www.masterlock.com/search/all-products?term=&page=1&ajax=1&sortBy=price&sortByOrder=DESC&pageSize=2447',
  taglineRu: 'Замки, LOTO и решения контроля доступа с 1921 года',
  descriptionRu:
    'Master Lock выпускает навесные замки, решения Lockout Tagout, замки для шкафчиков, дверную фурнитуру, сейфы, цепные и тросовые замки, а также аксессуары для ключей и блокировки оборудования. Каталог ниже собран по официальной полной выдаче Master Lock: категории взяты из product-card атрибутов primary и secondary category на сайте производителя.',
  heroColor: '#000000',
  heroGradient: 'linear-gradient(135deg, #111111 0%, #2a2a2a 44%, #d71920 100%)',
  heroTextColor: 'light',
  established: 1921,
  country: 'США',
  certifications: ['OSHA 1910.147', 'ANSI', 'UL'],
  industries: ['Энергетика', 'Производство', 'Обслуживание зданий', 'Логистика', 'Строительство'],
  categories: [
    { name: 'Навесные замки', iconName: 'lock', url: 'https://store.masterlock.com/collections/padlocks' },
    { name: 'Lockout Tagout', iconName: 'lock', url: 'https://www.masterlock.com/products/lockout-tagout' },
    { name: 'Дверная фурнитура', iconName: 'wrench', url: 'https://store.masterlock.com/collections/door-hardware' },
    { name: 'Кодовые замки', iconName: 'lock', url: 'https://www.masterlock.com/products/combination-locks' },
    { name: 'Цепные и тросовые замки', iconName: 'lock', url: 'https://store.masterlock.com/collections/cable-locks' },
  ],
  productCatalog: masterLockCatalog,
  featureBlocks: [
    {
      title: 'Категории из 2447 товаров',
      text: 'Страница использует официальную all-products выдачу Master Lock и группирует карточки по primary и secondary category.',
    },
    {
      title: 'Подбор под задачу',
      text: 'Synteco помогает подобрать серию замков, LOTO-комплект или аксессуары под объект, стандарт безопасности и схему ключевания.',
    },
  ],
};
