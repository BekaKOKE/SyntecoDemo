import type { BrandConfig } from './types';
import { uvexCatalog } from './uvex-catalog';

export const uvex: BrandConfig = {
  slug: 'uvex',
  name: 'Uvex',
  legalName: 'UVEX WINTER HOLDING GmbH & Co. KG',
  logoUrl: '/brands/uvex/logo.webp',
  website: 'https://www.uvex-safety.com',
  taglineRu: 'Защищает людей. Век за веком.',
  descriptionRu:
    'uvex safety — один из мировых лидеров в области средств индивидуальной защиты. Компания разрабатывает и производит полный комплект СИЗ «с головы до ног»: защитные каски и каскетки, защитные очки и очки с диоптриями, средства защиты слуха, респираторы, защитные перчатки, защитную обувь, спецодежду и индивидуально адаптированные СИЗ. Большинство изделий разрабатывается и производится на собственных площадках в Германии — с упором на инновации, эргономику и подтверждённое качество. Каталог ниже повторяет актуальную структуру раздела Products на официальном сайте uvex-safety.com.',
  heroColor: '#000000',
  heroTextColor: 'light',
  established: 1926,
  country: 'Германия',
  certifications: ['EN 166', 'EN 170', 'EN 352', 'EN 388', 'EN 149', 'EN ISO 20345', 'CE'],
  industries: ['Промышленность', 'Нефтегаз', 'Химия', 'Металлообработка', 'Строительство', 'Автомобилестроение', 'Логистика'],
  categories: [
    { name: 'Защитные каски', iconName: 'shield', url: 'https://www.uvex-safety.com/en/products/safety-helmets/' },
    { name: 'Защитные очки', iconName: 'shield', url: 'https://www.uvex-safety.com/en/products/safety-glasses/' },
    { name: 'Защита слуха', iconName: 'package', url: 'https://www.uvex-safety.com/en/products/hearing-protection/' },
    { name: 'Респираторы', iconName: 'warning', url: 'https://www.uvex-safety.com/en/products/respiratory-protection/' },
    { name: 'Защитные перчатки', iconName: 'package', url: 'https://www.uvex-safety.com/en/products/safety-gloves/' },
    { name: 'Защитная обувь', iconName: 'package', url: 'https://www.uvex-safety.com/en/products/safety-shoes/' },
    { name: 'Спецодежда', iconName: 'package', url: 'https://www.uvex-safety.com/en/products/protective-clothing-and-workwear/' },
    { name: 'Индивидуальные СИЗ', iconName: 'wrench', url: 'https://www.uvex-safety.com/en/individual-ppe/prescription-safety-spectacles/' },
  ],
  productCatalog: uvexCatalog,
  featureBlocks: [
    {
      title: 'Полный комплект СИЗ',
      text: 'uvex закрывает защиту работника с головы до ног — от касок и очков до перчаток, обуви и спецодежды — в рамках единой системы.',
    },
    {
      title: 'Разработано и произведено в Германии',
      text: 'Большинство продуктов uvex создаётся и производится на собственных площадках компании с собственной научно-исследовательской и производственной базой.',
    },
    {
      title: 'Официальная структура каталога',
      text: 'Каждая карточка содержит изображение производителя и ведёт напрямую в соответствующий раздел официального сайта uvex-safety.com.',
    },
  ],
};
