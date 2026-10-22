import type { BrandConfig } from './types';
import { univetCatalog } from './univet-catalog';

export const univet: BrandConfig = {
  slug: 'univet',
  name: 'Univet',
  legalName: 'Univet S.r.l.',
  logoUrl: '/brands/univet/logo.webp',
  website: 'https://www.univetsafety.com',
  taglineRu: 'Итальянские защитные, лазерные и корригирующие очки',
  descriptionRu:
    'Univet основана инженером Армандо Портези в 1997 году в Брешии, Италия. Опыт производства очков для модных брендов компания перенесла в промышленную защиту глаз, объединив эргономику, дизайн и технические характеристики.\n\nUnivet выпускает защитные очки, корригирующие модели, лазерную защиту и медицинские оптические системы. Продукция разрабатывается с вниманием к посадке и совместимости с другими СИЗ.',
  heroColor: '#56A534',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,255,255,.20), transparent 25%), linear-gradient(135deg, #06110a 0%, #17472b 52%, #56a534 100%)',
  heroTextColor: 'light',
  established: 1997,
  country: 'Италия',
  certifications: ['EN 166', 'EN 170', 'ANSI Z87.1', 'ISO 9001'],
  industries: ['Производство', 'Лаборатории', 'Медицина', 'Лазерные технологии', 'Строительство'],
  categories: [
    { name: 'Защитные очки', iconName: 'shield', url: 'https://www.univetsafety.com/en/products/safety/spectacles/' },
    { name: 'Закрытые очки', iconName: 'shield', url: 'https://www.univetsafety.com/en/products/safety/goggles/' },
    { name: 'Корригирующие СИЗ', iconName: 'package', url: 'https://www.univetsafety.com/en/products/prescription-safety/' },
    { name: 'Лазерная защита', iconName: 'warning', url: 'https://www.univetlaser.com/en/products/laser-eye-protection/' },
    { name: 'Медицинская оптика', iconName: 'package', url: 'https://www.univetsafety.com/en/products/medical/' },
  ],
  productCatalog: univetCatalog,
  featureBlocks: [
    { title: 'Итальянская эргономика', text: 'Форма оправ и регулировки рассчитаны на устойчивую посадку в течение рабочей смены.' },
    { title: 'Оптические решения', text: 'Доступны стандартные, корригирующие и специализированные лазерные линзы.' },
    { title: 'Совместимость СИЗ', text: 'Модели проектируются для совместной работы с касками, респираторами и средствами защиты слуха.' },
  ],
};
