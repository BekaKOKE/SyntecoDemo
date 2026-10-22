import type { BrandConfig } from './types';
import { peliCatalog } from './peli-catalog';

export const peli: BrandConfig = {
  slug: 'peli',
  name: 'Peli',
  legalName: 'Peli Products, S.L.U. (Pelican Products, Inc.)',
  // Логотип с птицей и надписью PELI. Файл переименован в logo-v2.webp,
  // чтобы браузеры и CDN не отдавали закэшированный старый logo.webp.
  logoUrl: '/brands/peli/logo-v2.webp',
  website: 'https://peli.com/eu/en/',
  taglineRu: 'Защитные кейсы, профессиональное освещение и температурная упаковка',
  descriptionRu:
    'История Peli началась в 1976 году в Торрансе, Калифорния. В регионе EMEA продукция Pelican Products представлена под торговой маркой Peli — это один производитель и единые стандарты качества.\n\nБренд выпускает прочные защитные кейсы, переносные фонари и решения для температурно-контролируемой логистики. Продукцию используют экстренные службы, промышленность, военные, фотографы и технические специалисты.',
  heroColor: '#D71920',
  heroGradient:
    'radial-gradient(circle at 82% 16%, rgba(255,255,255,.18), transparent 25%), linear-gradient(135deg, #210304 0%, #6e090d 52%, #d71920 100%)',
  heroTextColor: 'light',
  established: 1976,
  country: 'США',
  certifications: ['IP67', 'MIL-STD-810G', 'ATA 300', 'CE'],
  industries: ['Экстренные службы', 'Оборона', 'Промышленность', 'Фото и видео', 'Фармацевтика'],
  categories: [
    { name: 'Защитные кейсы', iconName: 'package', url: 'https://www.peli.com/eu/en/products/cases/protector-cases' },
    { name: 'Переносное освещение', iconName: 'bolt', url: 'https://www.peli.com/eu/en/products/flashlights/' },
    { name: 'Температурная упаковка', iconName: 'shield', url: 'https://pelibiothermal.com/' },
    { name: 'Кейсы для оборудования', iconName: 'lock', url: 'https://www.peli.com/eu/en/products/cases/' },
    { name: 'Аксессуары', iconName: 'wrench', url: 'https://www.peli.com/eu/en/discover/case-accessories/' },
  ],
  productCatalog: peliCatalog,
  featureBlocks: [
    { title: 'Защита оборудования', text: 'Жёсткие кейсы рассчитаны на перевозку чувствительной техники в сложных условиях.' },
    { title: 'Рабочий свет', text: 'Фонари и мобильные световые системы предназначены для профессионального применения.' },
    { title: 'Холодовая цепь', text: 'Температурная упаковка поддерживает контролируемую перевозку фармацевтической продукции.' },
  ],
};
