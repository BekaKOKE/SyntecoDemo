import { pipDatasheetUrl, pipImageUrl, pipProductUrl } from './brands/pip-products/build';

/**
 * Витрина «Популярные товары» на главной.
 *
 * Десять позиций из каталога, который мы ведём у себя: по одной из разных
 * групп СИЗ, чтобы блок читался как срез ассортимента, а не как подборка
 * одного производителя. У каждой карточки есть техпаспорт и ссылка на
 * страницу товара у изготовителя — обе строятся из его внутреннего
 * идентификатора, поэтому ведут строго на этот товар.
 *
 * Названия здесь короткие и русские: блок стоит рядом с остальным
 * содержимым главной. Полное английское наименование и артикул
 * производителя остаются на /brands/pip, где по ним ищут закупщики.
 */
export interface ShowcaseProduct {
  /** Идентификатор товара у изготовителя — из него строятся обе ссылки. */
  pid: string;
  scId: number;
  ccId: number;
  /** Линейка, показывается над названием. */
  brand: string;
  /** Короткое русское название для карточки. */
  title: string;
  /** Артикул изготовителя — по нему товар ищут в запросе. */
  sku: string;
  /** Одно-два предложения: чем эта модель отличается. */
  summary: string;
  /** Путь к фото на CDN изготовителя. */
  imagePath: string;
  /** Короткие метки под описанием — стандарт, размерный ряд и т. п. */
  tags: string[];
}

const SHOWCASE: ShowcaseProduct[] = [
  {
    pid: '1214',
    scId: 2560,
    ccId: 11549,
    brand: 'ATG® MaxiFlex® Ultimate™',
    title: 'Перчатки нитриловые, под сенсорный экран',
    sku: '34-874',
    summary:
      'Дышащая бесшовная перчатка: точный захват в сухих средах, работает с сенсорным экраном.',
    imagePath: '/archive/pim/300/1/34-874---UP.jpg',
    tags: ['Нейлон / эластан', 'XXS–3XL'],
  },
  {
    pid: '92071',
    scId: 2569,
    ccId: 11575,
    brand: 'PIP® Kilimanjaro™',
    title: 'Каска с полными полями, храповая регулировка',
    sku: '280-HP641R',
    summary:
      'Корпус HDPE, подвеска с колёсиком-храповиком. Полные поля закрывают шею и уши.',
    imagePath: '/archive/pim/300/3/280-HP641R-01---FR.jpg',
    tags: ['19 цветов', 'HDPE'],
  },
  {
    pid: '35640',
    scId: 2562,
    ccId: 11613,
    brand: 'Bouton® Optical',
    title: 'Очки защитные с сетчатыми боковыми щитками',
    sku: '249-5907-400',
    summary:
      'Полная оправа и щитки из металлической сетки. Покрытие от царапин и запотевания.',
    imagePath: '/archive/pim/300/2/249-5907-400---FL.jpg',
    tags: ['Прозрачная линза', 'Anti-fog'],
  },
  {
    pid: '143194',
    scId: 2568,
    ccId: 11574,
    brand: 'PIP® V3™',
    title: 'Наушники противошумные с оголовьем',
    sku: '263-V3HB',
    summary:
      'Старшая модель линейки: рассчитана на самый тяжёлый шум. Оголовье регулируется.',
    imagePath: '/archive/pim/300/9/263-V3HB.jpg',
    tags: ['NRR 29 дБ', 'Регулируемое оголовье'],
  },
  {
    pid: '172912',
    scId: 2584,
    ccId: 11785,
    brand: 'Miller® H500',
    title: 'Привязь страховочная, 5 точек регулировки',
    sku: 'H5IC22102',
    summary:
      'Боковые D-кольца добавляют рабочее позиционирование. Быстросъёмные пряжки.',
    imagePath: '/archive/pim/300/45/H5IC22100_front.jpg',
    tags: ['S/M – 2XL', 'Заднее и боковые D-кольца'],
  },
  {
    pid: '92498',
    scId: 2566,
    ccId: 11571,
    brand: 'Dynamic™',
    title: 'Респиратор N95 с клапаном выдоха, 10 шт.',
    sku: '270-RPD714N95',
    summary:
      'Класс N95 с одобрением NIOSH. Клапан выдоха облегчает долгое ношение.',
    imagePath: '/archive/pim/300/11/270-RPD714N95---F---NO STRAPS.jpg',
    tags: ['N95 · NIOSH', 'Упаковка 10 шт.'],
  },
  {
    pid: '129247',
    scId: 2585,
    ccId: 11703,
    brand: 'Caiman®',
    title: 'Краги сварщика MIG/Stick, оленья кожа',
    sku: '1816',
    summary:
      'Мягкий спилок оленьей кожи: подвижность кисти при полном утеплении.',
    imagePath: '/archive/pim/300/9/1816.jpg',
    tags: ['MIG / Stick', 'M–2XL'],
  },
  {
    pid: '90008',
    scId: 2563,
    ccId: 11566,
    brand: 'PIP®',
    title: 'Жилет сигнальный, огнестойкий и дугостойкий',
    sku: '305-2200',
    summary:
      'Там, где сигнальная одежда должна сочетаться с защитой от огня и дуги.',
    imagePath: '/archive/pim/300/10/305-2000---MF.jpg',
    tags: ['ANSI класс 2', 'AR/FR'],
  },
  {
    pid: '132592',
    scId: 2575,
    ccId: 11622,
    brand: 'Kut Gard®',
    title: 'Нарукавник от порезов, однослойный',
    sku: 'MSATP',
    summary:
      'Смесь ATA®: стойкость к порезам без потери комфорта. Держится всю смену.',
    imagePath: '/archive/pim/300/14/MSATP-18---UP.jpg',
    tags: ['Длина 12″–22″', 'Стирка без потери свойств'],
  },
  {
    pid: '149560',
    scId: 2586,
    ccId: 11830,
    brand: 'PUMA® Safety Velocity',
    title: 'Полуботинки защитные с композитным подноском',
    sku: '642855-202',
    summary:
      'Защитная обувь, которая не выглядит защитной. Ударостойкий подносок.',
    imagePath: '/archive/pim/300/14/642855_VELOCITY_WNS_LOW_202_single_02.jpg',
    tags: ['Стальной подносок', 'Антистатика'],
  },
];

export interface ShowcaseCard {
  id: string;
  title: string;
  variantId: string;
  brandName: string;
  imageUrl: string;
  descriptionRu: string;
  attributes: Record<string, string>;
  documents: Array<{ id: string; type: string; name: string; url: string }>;
  href: string;
}

/**
 * Приводит витрину к тем же полям, что и товар из базы, чтобы блок на
 * главной рисовался обычной карточкой и не расходился с ней по вёрстке.
 * Ссылки кладём в documents — карточка сама достаёт их оттуда.
 */
export function getShowcaseProducts(): ShowcaseCard[] {
  return SHOWCASE.map(p => ({
    id: `showcase-${p.pid}`,
    title: p.title,
    variantId: p.sku,
    brandName: p.brand,
    imageUrl: pipImageUrl(p.imagePath),
    descriptionRu: p.summary,
    attributes: p.tags.reduce<Record<string, string>>((acc, tag, i) => {
      acc[`Метка ${i + 1}`] = tag;
      return acc;
    }, {}),
    documents: [
      {
        id: `${p.pid}-ds`,
        type: 'datasheet',
        name: 'Техпаспорт',
        url: pipDatasheetUrl(p.pid),
      },
      {
        id: `${p.pid}-mfg`,
        type: 'manufacturer',
        name: 'Страница производителя',
        url: pipProductUrl(p.scId, p.ccId, p.pid),
      },
    ],
    // Карточки в базе нет — ведём на наш каталог, а не на несуществующий /products/[id].
    href: '/brands/pip',
  }));
}
