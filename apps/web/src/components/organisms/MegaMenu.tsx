'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { OFFICIAL_BRANDS } from '@/config/brands';

interface CategoryNode {
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  level?: number;
  productCount?: number;
  children?: CategoryNode[];
}

interface MenuLink {
  label: string;
  slug?: string;
  query?: string;
  href?: string;
}

interface MenuSection {
  name: string;
  slug: string;
  note: string;
  links: MenuLink[];
}

interface MegaMenuProps {
  cats: CategoryNode[];
  onClose: () => void;
}

const ROOT_CATEGORY_SLUGS = [
  'bezopasnost',
  'instrumenty',
  'krepezh',
  'elektrika',
  'pnevmatika',
  'gidravlika',
  'santekhnika',
  'dvigateli',
  'podshipniki',
  'upakovka',
  'laboratoriya',
  'uborka',
  'avtopark',
  'svarka',
  'syrye-materialy',
  'promyshlennaya-furnitura',
  'ohrannye-sistemy',
  'mebel-i-hoztovary',
  'lakokrasochnye-materialy',
  'ulichnoe-oborudovanie',
  'ofisnye-tovary',
];

const MENU_SECTIONS: MenuSection[] = [
  {
    name: 'Безопасность',
    slug: 'bezopasnost',
    note: 'СИЗ, пожарная безопасность, маркировка',
    links: [
      { label: 'СИЗ', slug: 'siz' },
      { label: 'Защита рук', query: 'перчатки защита рук' },
      { label: 'Защита глаз', query: 'защитные очки' },
      { label: 'Защита слуха', query: 'беруши защита слуха' },
      { label: 'Респираторы', slug: 'respirators' },
      { label: 'Огнетушители', slug: 'fire-extinguishers' },
      { label: 'Замки LOTO', slug: 'loto-locks' },
      { label: 'Спецодежда', query: 'спецодежда' },
      { label: 'Знаки безопасности', slug: 'znaki-bezopasnosti' },
    ],
  },
  {
    name: 'Сырьё и материалы',
    slug: 'syrye-materialy',
    note: 'Металлопрокат, резина, пластики, композиты',
    links: [
      { label: 'Металлопрокат', slug: 'metalloprokat' },
      { label: 'Резина и пеноматериалы', slug: 'rezina-penomaterialy' },
      { label: 'Пластики', slug: 'plastiki' },
      { label: 'Композиты и технические ткани', slug: 'kompozity-tehnicheskie-tkani' },
    ],
  },
  {
    name: 'Промышленная фурнитура',
    slug: 'promyshlennaya-furnitura',
    note: 'Фурнитура, опоры, заглушки, комплектующие',
    links: [
      { label: 'Дверная и оконная фурнитура', slug: 'dvernaya-furnitura' },
      { label: 'Виброопоры', slug: 'vibroopory' },
      { label: 'Заглушки и колпачки', slug: 'zaglushki-kolpachki' },
      { label: 'Крюки и защёлки', slug: 'kryuki-zashchelki' },
      { label: 'Поручни и защита стен', slug: 'poruchni-zashchita-sten' },
      { label: 'Запчасти и комплектующие', slug: 'zapchasti-i-komplektuyushchie' },
    ],
  },
  {
    name: 'Охранные системы',
    slug: 'ohrannye-sistemy',
    note: 'Замки, доступ, видеонаблюдение, идентификация',
    links: [
      { label: 'Замки и ключи', slug: 'zamki-i-klyuchi' },
      { label: 'Видеонаблюдение', slug: 'videonablyudenie' },
      { label: 'Контроль доступа', slug: 'kontrol-dostupa' },
      { label: 'Идентификация', slug: 'identifikatsiya' },
      { label: 'Служебная безопасность', slug: 'sluzhebnaya-bezopasnost' },
      { label: 'Охранное оборудование', slug: 'ohrannoe-oborudovanie' },
    ],
  },
  {
    name: 'Мебель и хозтовары',
    slug: 'mebel-i-hoztovary',
    note: 'Мебель, оснащение помещений, общепит',
    links: [
      { label: 'Промышленная мебель', slug: 'promyshlennaya-mebel' },
      { label: 'Обустройство помещений', slug: 'obustroystvo-pomeshcheniy' },
      { label: 'Гостиничные товары', slug: 'gostinichnye-tovary' },
      { label: 'Общепит', slug: 'obshchepit' },
      { label: 'Спортивный инвентарь', slug: 'sportivnyy-inventar' },
      { label: 'Бытовая техника и запчасти', slug: 'bytovaya-tehnika-zapchasti' },
    ],
  },
  {
    name: 'Лакокрасочные материалы',
    slug: 'lakokrasochnye-materialy',
    note: 'Краски, малярный инструмент, оборудование',
    links: [
      { label: 'Краски и покрытия', slug: 'kraski-pokrytiya' },
      { label: 'Малярный инструмент', slug: 'malyarnyy-instrument' },
      { label: 'Окрасочное оборудование', slug: 'okrasochnoe-oborudovanie' },
    ],
  },
  {
    name: 'Уличное оборудование',
    slug: 'ulichnoe-oborudovanie',
    note: 'Садовый инструмент, мойки, снегоуборка',
    links: [
      { label: 'Садовый инструмент', slug: 'sadovyy-instrument' },
      { label: 'Мойки высокого давления', slug: 'moyki-vysokogo-davleniya' },
      { label: 'Снегоуборка', slug: 'snegouborka' },
      { label: 'Малые двигатели', slug: 'malye-dvigateli' },
      { label: 'Борьба с вредителями', slug: 'borba-s-vreditelyami' },
    ],
  },
  {
    name: 'Офисные товары',
    slug: 'ofisnye-tovary',
    note: 'Канцелярия, печать, офисное оборудование',
    links: [
      { label: 'Канцелярия', slug: 'kancelyariya' },
      { label: 'Расходники для печати', slug: 'rashodniki-dlya-pechati' },
      { label: 'Компьютерные аксессуары', slug: 'kompyuternye-aksessuary' },
      { label: 'Офисное оборудование', slug: 'ofisnoe-oborudovanie' },
    ],
  },
  {
    name: 'Инструменты',
    slug: 'instrumenty',
    note: 'Ручной, электрический, измерительный',
    links: [
      { label: 'Электроинструмент', slug: 'elektroinstrumenty' },
      { label: 'Ручной инструмент', slug: 'ruchnoy-instrument' },
      { label: 'Сверление', query: 'drill bits сверла' },
      { label: 'Измерительный инструмент', query: 'measuring tools' },
      { label: 'Оснастка', query: 'tooling' },
      { label: 'Абразивы', query: 'abrasives' },
      { label: 'Наборы инструментов', query: 'tool set' },
    ],
  },
  {
    name: 'Крепеж',
    slug: 'krepezh',
    note: 'Болты, винты, гайки, анкеры',
    links: [
      { label: 'Болты и винты', query: 'bolts screws' },
      { label: 'Гайки', query: 'nuts' },
      { label: 'Шайбы', query: 'washers' },
      { label: 'Анкеры', query: 'anchors' },
      { label: 'Штифты', query: 'pins' },
      { label: 'Пружины', query: 'springs' },
      { label: 'Уплотнения', query: 'sealing supplies' },
      { label: 'Резьбовые вставки', query: 'threaded inserts' },
    ],
  },
  {
    name: 'Электрика',
    slug: 'elektrika',
    note: 'Кабель, автоматика, свет, КИПиА',
    links: [
      { label: 'Кабели и провода', slug: 'kabeli' },
      { label: 'Разъемы и клеммы', query: 'electrical connectors' },
      { label: 'Щиты и корпуса', query: 'electrical enclosures' },
      { label: 'Автоматы и предохранители', query: 'circuit breakers fuses' },
      { label: 'Реле и контакторы', query: 'relays contactors' },
      { label: 'Освещение', query: 'lighting fixtures' },
      { label: 'Кабель-каналы', query: 'wire management' },
      { label: 'КИПиА', query: 'industrial controls automation' },
    ],
  },
  {
    name: 'Пневматика',
    slug: 'pnevmatika',
    note: 'Сжатый воздух, цилиндры, клапаны',
    links: [
      { label: 'Пневмоцилиндры', slug: 'pnevmo-tsilindry' },
      { label: 'Пневмоинструмент', query: 'pneumatic tools' },
      { label: 'Клапаны', query: 'pneumatic valves' },
      { label: 'Компрессоры', query: 'air compressors' },
      { label: 'Подготовка воздуха', query: 'compressed air treatment' },
      { label: 'Фитинги', query: 'pneumatic fittings' },
      { label: 'Шланги', query: 'air hose' },
    ],
  },
  {
    name: 'Гидравлика',
    slug: 'gidravlika',
    note: 'Насосы, цилиндры, рукава высокого давления',
    links: [
      { label: 'Гидроцилиндры', query: 'hydraulic cylinders' },
      { label: 'Гидронасосы', query: 'hydraulic pumps' },
      { label: 'Клапаны', query: 'hydraulic valves' },
      { label: 'Фитинги', query: 'hydraulic fittings' },
      { label: 'Рукава и шланги', query: 'hydraulic hose' },
      { label: 'Уплотнения', query: 'hydraulic seals' },
      { label: 'Гидроинструмент', query: 'hydraulic tools' },
    ],
  },
  {
    name: 'Сантехника',
    slug: 'santekhnika',
    note: 'Трубы, фитинги, клапаны, HVAC',
    links: [
      { label: 'Трубы и фитинги', query: 'pipe fittings' },
      { label: 'Клапаны', query: 'plumbing valves' },
      { label: 'Насосы', query: 'pumps' },
      { label: 'Шланги и рукава', query: 'hose fittings' },
      { label: 'Фильтрация', query: 'filtration' },
      { label: 'HVAC', query: 'hvac refrigeration' },
      { label: 'Вентиляция', query: 'ventilation equipment' },
      { label: 'Уплотнения', query: 'gaskets seals' },
    ],
  },
  {
    name: 'Двигатели',
    slug: 'dvigateli',
    note: 'Электродвигатели, приводы, обслуживание',
    links: [
      { label: 'AC-двигатели', query: 'AC motors' },
      { label: 'Мотор-редукторы', query: 'gearmotors' },
      { label: 'Приводы', query: 'motor drives' },
      { label: 'Конденсаторы', query: 'motor capacitors' },
      { label: 'Ремни', query: 'belts' },
      { label: 'Муфты', query: 'shaft couplings' },
      { label: 'Обслуживание двигателей', query: 'motor maintenance' },
    ],
  },
  {
    name: 'Подшипники',
    slug: 'podshipniki',
    note: 'Подшипники и передача мощности',
    links: [
      { label: 'Подшипники', query: 'bearings' },
      { label: 'Ремни и шкивы', query: 'belts pulleys' },
      { label: 'Цепи и звездочки', query: 'roller chains sprockets' },
      { label: 'Муфты', query: 'shaft couplings' },
      { label: 'Валы', query: 'rotary shafts' },
      { label: 'Линейное перемещение', query: 'linear motion' },
      { label: 'Уплотнения валов', query: 'rotary shaft sealing' },
    ],
  },
  {
    name: 'Упаковка',
    slug: 'upakovka',
    note: 'Склад, тара, транспортировка, маркировка',
    links: [
      { label: 'Коробки и тара', query: 'shipping boxes' },
      { label: 'Скотч и ленты', query: 'packaging tape' },
      { label: 'Стропы', query: 'strapping' },
      { label: 'Маркировка', query: 'shipping labels' },
      { label: 'Складское хранение', query: 'storage shelving' },
      { label: 'Тележки', query: 'transporting carts' },
      { label: 'Подъем и перемещение', query: 'lifting pulling positioning' },
    ],
  },
  {
    name: 'Лаборатория',
    slug: 'laboratoriya',
    note: 'Измерение, посуда, приборы, расходники',
    links: [
      { label: 'Измерительные приборы', query: 'measurement instruments' },
      { label: 'Контейнеры и емкости', query: 'plastic glass containers' },
      { label: 'Лабораторное оборудование', query: 'lab equipment' },
      { label: 'Фильтры и сита', query: 'lab filters sieving' },
      { label: 'Лабораторная мебель', query: 'lab furniture' },
      { label: 'Вентиляция', query: 'lab ventilation' },
      { label: 'Температурный контроль', query: 'temperature measurement' },
    ],
  },
  {
    name: 'Уборка',
    slug: 'uborka',
    note: 'Инвентарь, химия, расходники',
    links: [
      { label: 'Инвентарь', query: 'cleaning supplies' },
      { label: 'Профессиональная химия', query: 'cleaning chemicals' },
      { label: 'Мусор и переработка', query: 'trash recycling supplies' },
      { label: 'Бумага и салфетки', query: 'paper towels wipes' },
      { label: 'Дозаторы', query: 'dispensers' },
      { label: 'Поломоечные машины', query: 'floor cleaning machines' },
    ],
  },
  {
    name: 'Автопарк',
    slug: 'avtopark',
    note: 'Обслуживание техники и транспорта',
    links: [
      { label: 'Фильтры', query: 'vehicle filters' },
      { label: 'АКБ и электрика', query: 'vehicle battery power' },
      { label: 'Масла и смазки', query: 'lubricants vehicle' },
      { label: 'Шины и тормоза', query: 'tire brake maintenance' },
      { label: 'Прицепное оборудование', query: 'towing trailer equipment' },
      { label: 'Гаражное оборудование', query: 'garage equipment' },
      { label: 'Автоинструмент', query: 'vehicle tools' },
    ],
  },
  {
    name: 'Сварка',
    slug: 'svarka',
    note: 'Материалы, газовое оборудование, аппараты',
    links: [
      { label: 'Электроды и проволока', query: 'filler metals welding' },
      { label: 'Газовое оборудование', query: 'gas equipment welding' },
      { label: 'Сварочные аппараты', query: 'arc welding' },
      { label: 'Припой и пайка', query: 'soldering brazing' },
      { label: 'Средства защиты сварщика', query: 'welding safety' },
      { label: 'Шпилькосварка', query: 'stud welding' },
    ],
  },
];

const LEFT_BLOCKS = [
  {
    title: 'Часто ищут',
    links: [
      { label: 'Респираторы 3M', query: 'Респираторы 3M' },
      { label: 'Перчатки нитриловые', query: 'нитриловые перчатки' },
      { label: 'Кабели и провода', slug: 'kabeli' },
      { label: 'Болты и крепеж', query: 'болты крепеж' },
      { label: 'Пневмоцилиндры', slug: 'pnevmo-tsilindry' },
    ],
  },
  {
    title: 'Популярные категории',
    links: [
      { label: 'Сантехника', slug: 'santekhnika' },
      { label: 'Безопасность', slug: 'bezopasnost' },
      { label: 'Крепеж', slug: 'krepezh' },
      { label: 'Упаковка', slug: 'upakovka' },
      { label: 'Электрика', slug: 'elektrika' },
    ],
  },
  {
    title: 'Самые посещаемые разделы',
    links: [
      { label: 'Все товары', href: '/products' },
      { label: 'Новинки', href: '/products?sortBy=createdAt&sortDir=desc' },
      { label: 'Бренды A-Z', href: '/brands' },
      { label: 'Запросить КП', href: '/checkout' },
    ],
  },
];

const BRAND_LINKS = OFFICIAL_BRANDS.map((b) => ({
  name: b.name,
  href: `/brands/${b.slug}`,
}));

const QUERY_CATEGORY_SLUGS: Record<string, string> = {
  'перчатки защита рук': 'zashchita-ruk',
  'защитные очки': 'zashchita-glaz',
  'беруши защита слуха': 'zashchita-slukha',
  'спецодежда': 'spetsodezhda',
  'Респираторы 3M': 'respirators',
  'нитриловые перчатки': 'zashchita-ruk',
  'болты крепеж': 'bolty-vinty',
  'drill bits сверла': 'sverlenie',
  'measuring tools': 'izmeritelnyy-instrument',
  tooling: 'osnastka',
  abrasives: 'abrazivy',
  'tool set': 'nabory-instrumentov',
  'bolts screws': 'bolty-vinty',
  nuts: 'gayki',
  washers: 'shayby',
  anchors: 'ankery',
  pins: 'shtifty',
  springs: 'pruzhiny',
  'sealing supplies': 'uplotneniya',
  'threaded inserts': 'rezbovye-vstavki',
  'electrical connectors': 'razemy-klemmy',
  'electrical enclosures': 'shchity-korpusa',
  'circuit breakers fuses': 'avtomaty-predohraniteli',
  'relays contactors': 'rele-kontaktory',
  'lighting fixtures': 'osveshchenie',
  'wire management': 'kabel-kanaly',
  'industrial controls automation': 'kipia',
  'pneumatic tools': 'pnevmo-instrument',
  'pneumatic valves': 'pnevmo-klapany',
  'air compressors': 'kompressory',
  'compressed air treatment': 'podgotovka-vozduha',
  'pneumatic fittings': 'pnevmo-fitingi',
  'air hose': 'pnevmo-shlangi',
  'hydraulic cylinders': 'gidro-tsilindry',
  'hydraulic pumps': 'gidro-nasosy',
  'hydraulic valves': 'gidro-klapany',
  'hydraulic fittings': 'gidro-fitingi',
  'hydraulic hose': 'gidro-rukava',
  'hydraulic seals': 'gidro-uplotneniya',
  'hydraulic tools': 'gidro-instrument',
  'pipe fittings': 'truby-fitingi',
  'plumbing valves': 'klapany',
  pumps: 'nasosy',
  'hose fittings': 'shlangi-rukava',
  filtration: 'filtratsiya',
  'hvac refrigeration': 'hvac',
  'ventilation equipment': 'ventilyatsiya',
  'gaskets seals': 'santeh-uplotneniya',
  'AC motors': 'ac-dvigateli',
  gearmotors: 'motor-reduktory',
  'motor drives': 'privody',
  'motor capacitors': 'kondensatory',
  'motor maintenance': 'obsluzhivanie-dvigateley',
  bearings: 'podshipniki-main',
  'belts pulleys': 'remni-shkivy',
  'roller chains sprockets': 'tsepi-zvezdochki',
  'rotary shafts': 'valy',
  'linear motion': 'lineynoe-peremeshchenie',
  'rotary shaft sealing': 'uplotneniya-valov',
  'shipping boxes': 'korobki-tara',
  'packaging tape': 'skotch-lenty',
  strapping: 'stropy',
  'shipping labels': 'markirovka',
  'storage shelving': 'skladskoe-hranenie',
  'transporting carts': 'telezhki',
  'lifting pulling positioning': 'podem-peremeshchenie',
  'measurement instruments': 'izmeritelnye-pribory',
  'plastic glass containers': 'konteynery-emkosti',
  'lab equipment': 'laboratornoe-oborudovanie',
  'lab filters sieving': 'laboratornye-filtry',
  'lab furniture': 'laboratornaya-mebel',
  'lab ventilation': 'laboratornaya-ventilyatsiya',
  'temperature measurement': 'temperaturnyy-kontrol',
  'cleaning supplies': 'inventar',
  'cleaning chemicals': 'professionalnaya-himiya',
  'trash recycling supplies': 'musor-pererabotka',
  'paper towels wipes': 'bumaga-salfetki',
  dispensers: 'dozatory',
  'floor cleaning machines': 'polomoechnye-mashiny',
  'vehicle filters': 'avto-filtry',
  'vehicle battery power': 'akb-elektrika',
  'lubricants vehicle': 'masla-smazki',
  'tire brake maintenance': 'shiny-tormoza',
  'towing trailer equipment': 'pricepnoe-oborudovanie',
  'garage equipment': 'garazhnoe-oborudovanie',
  'vehicle tools': 'avtoinstrument',
  'filler metals welding': 'elektrody-provoloka',
  'gas equipment welding': 'gazovoe-oborudovanie',
  'arc welding': 'svarochnye-apparaty',
  'soldering brazing': 'payka',
  'welding safety': 'zaschita-svarshchika',
  'stud welding': 'shpilkosvarka',
};

const CONTEXT_QUERY_CATEGORY_SLUGS: Record<string, string> = {
  'dvigateli:belts': 'remni',
  'dvigateli:shaft couplings': 'mufty',
  'podshipniki:shaft couplings': 'mufty-valy',
};

function flattenCategories(cats: CategoryNode[]) {
  const bySlug = new Map<string, CategoryNode>();
  const visit = (cat: CategoryNode) => {
    bySlug.set(cat.slug, cat);
    cat.children?.forEach(visit);
  };
  cats.forEach(visit);
  return bySlug;
}

function categoryHref(slug: string, bySlug: Map<string, CategoryNode>) {
  return bySlug.has(slug) ? `/categories/${slug}` : `/search?q=${encodeURIComponent(slug)}`;
}

function resolveLinkSlug(link: MenuLink, contextSlug?: string) {
  if (link.slug) return link.slug;
  if (!link.query) return undefined;
  return CONTEXT_QUERY_CATEGORY_SLUGS[`${contextSlug ?? ''}:${link.query}`] ?? QUERY_CATEGORY_SLUGS[link.query];
}

function linkHref(link: MenuLink, bySlug: Map<string, CategoryNode>, contextSlug?: string) {
  if (link.href) return link.href;
  const targetSlug = resolveLinkSlug(link, contextSlug);
  if (targetSlug && bySlug.has(targetSlug)) return `/categories/${targetSlug}`;
  return `/search?q=${encodeURIComponent(link.query ?? link.label)}`;
}

function linkCount(link: MenuLink, bySlug: Map<string, CategoryNode>, contextSlug?: string) {
  const slug = resolveLinkSlug(link, contextSlug);
  return slug ? bySlug.get(slug)?.productCount ?? 0 : 0;
}

function CountBadge({ count, compact }: { count: number; compact?: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        minWidth: compact ? 24 : 30,
        height: compact ? 18 : 22,
        padding: compact ? '0 6px' : '0 8px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-hair)',
        color: 'var(--color-ink-4)',
        fontSize: compact ? 10 : 11,
        fontWeight: 800,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {count}
    </span>
  );
}

function rootSections(bySlug: Map<string, CategoryNode>) {
  const available = new Set(ROOT_CATEGORY_SLUGS.filter((slug) => bySlug.has(slug)));
  return MENU_SECTIONS
    .filter((section) => available.has(section.slug))
    .sort((a, b) => ROOT_CATEGORY_SLUGS.indexOf(a.slug) - ROOT_CATEGORY_SLUGS.indexOf(b.slug))
    .map((section) => ({
      ...section,
      links: [...section.links].sort((a, b) => {
        const aSlug = resolveLinkSlug(a, section.slug);
        const bSlug = resolveLinkSlug(b, section.slug);
        const aCount = aSlug ? bySlug.get(aSlug)?.productCount ?? 0 : 0;
        const bCount = bSlug ? bySlug.get(bSlug)?.productCount ?? 0 : 0;
        return bCount - aCount;
      }),
    }));
}

function PopularBrandStrip({ onClose, compact }: { onClose: () => void; compact?: boolean }) {
  return (
    <div
      style={{
        padding: compact ? '12px 16px' : '12px 14px',
        border: '1px solid var(--color-hair)',
        borderRadius: 8,
        background: 'linear-gradient(180deg, #fff, var(--color-surface-2))',
        boxShadow: compact ? 'none' : 'var(--shadow-1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: compact ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: compact ? '100%' : 150 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
            }}
          >
            Популярные бренды
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
          {BRAND_LINKS.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              onClick={onClose}
              className="mega-brand-chip"
              style={{
                padding: compact ? '7px 9px' : '8px 11px',
                border: '1px solid rgba(204, 0, 0, 0.28)',
                borderRadius: 6,
                background: 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
                fontSize: 12,
                fontWeight: 750,
                lineHeight: 1,
                textDecoration: 'none',
              }}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MegaMenu({ cats, onClose }: MegaMenuProps) {
  const [visible, setVisible] = useState(false);
  const bySlug = useMemo(() => flattenCategories(cats ?? []), [cats]);
  const sections = useMemo(() => rootSections(bySlug), [bySlug]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 56,
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
        width: 'min(1220px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 76px)',
        overflowY: 'auto',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-hair)',
        borderTop: '3px solid var(--color-accent)',
        borderRadius: 10,
        boxShadow: 'var(--shadow-3)',
        zIndex: 300,
        opacity: visible ? 1 : 0,
        transition: 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', minHeight: 520 }}>
        <aside
          style={{
            background: 'var(--color-surface-2)',
            borderRight: '1px solid var(--color-hair)',
            padding: '20px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 14 }}>
            <span style={{ width: 18, height: 2, background: 'var(--color-accent)', borderRadius: 999 }} />
            Быстрый доступ
          </div>
          {LEFT_BLOCKS.map((block) => (
            <div key={block.title} style={{ padding: '12px 0', borderTop: '1px solid var(--color-hair)' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-4)',
                  marginBottom: 8,
                }}
              >
                {block.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {block.links.map((link) => (
                  <Link
                    key={link.label}
                    href={linkHref(link, bySlug)}
                    onClick={onClose}
                    className="hover-bg"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '7px 8px',
                      borderRadius: 6,
                      color: 'var(--color-ink-2)',
                      fontSize: 12,
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <span>{link.label}</span>
                    <span style={{ color: 'var(--color-ink-5)' }}>›</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div style={{ padding: '20px 24px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-4)',
                  marginBottom: 6,
                }}
              >
                Каталог Synteco
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>
                Промышленное снабжение по разделам
              </div>
            </div>
            <Link
              href="/categories"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ flexShrink: 0, textDecoration: 'none' }}
            >
              Все категории →
            </Link>
          </div>

          <div style={{ marginBottom: 18 }}>
            <PopularBrandStrip onClose={onClose} />
          </div>

          {sections.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: 'center', color: 'var(--color-ink-4)', fontSize: 13 }}>
              Загрузка категорий...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '18px 24px',
              }}
            >
              {sections.map((section) => (
                <div key={section.slug} style={{ minWidth: 0, padding: 6, borderRadius: 8 }}>
                  <Link
                    href={categoryHref(section.slug, bySlug)}
                    onClick={onClose}
                    className="mega-section-title hover-bg"
                    style={{
                      display: 'block',
                      padding: '8px 8px 7px',
                      borderLeft: '2px solid transparent',
                      borderRadius: 6,
                      textDecoration: 'none',
                      color: 'var(--color-ink)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      <span>{section.name}</span>
                      <CountBadge count={bySlug.get(section.slug)?.productCount ?? 0} compact />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 3, lineHeight: 1.35 }}>
                      {section.note}
                    </div>
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 3 }}>
                    {section.links.slice(0, 8).map((link) => {
                      const count = linkCount(link, bySlug, section.slug);
                      return (
                        <Link
                          key={link.label}
                          href={linkHref(link, bySlug, section.slug)}
                          onClick={onClose}
                          className="mega-menu-child"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                            padding: '4px 8px',
                            borderRadius: 4,
                            color: 'var(--color-ink-3)',
                            fontSize: 12,
                            lineHeight: 1.25,
                            textDecoration: 'none',
                          }}
                        >
                          <span>{link.label}</span>
                          <CountBadge count={count} compact />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="hairt" style={{ marginTop: 20, paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/products"
                onClick={onClose}
                style={{ color: 'var(--color-accent)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
              >
                Перейти в полный каталог →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .mega-brand-chip {
          transition: transform 160ms cubic-bezier(.34,1.3,.64,1), box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
        }
        .mega-brand-chip:hover {
          transform: translateY(-2px);
          border-color: var(--color-accent) !important;
          background: #fff !important;
          box-shadow: 0 6px 16px rgba(204, 0, 0, 0.18);
        }
        .mega-menu-child {
          transition: color 120ms ease, padding-left 120ms ease, background 120ms ease;
        }
        .mega-section-title {
          transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
        }
        .mega-section-title:hover {
          border-left-color: var(--color-accent) !important;
          background: var(--color-accent-soft) !important;
        }
        .mega-menu-child:hover {
          color: var(--color-ink) !important;
          padding-left: 12px !important;
          background: var(--color-accent-soft);
        }
      `}</style>
    </div>
  );
}

export function MobileCatalogMenu({ cats, onClose }: MegaMenuProps) {
  const bySlug = useMemo(() => flattenCategories(cats ?? []), [cats]);
  const sections = useMemo(() => rootSections(bySlug), [bySlug]);
  const [openSlug, setOpenSlug] = useState<string>(sections[0]?.slug ?? 'bezopasnost');

  useEffect(() => {
    if (!sections.some((section) => section.slug === openSlug)) {
      setOpenSlug(sections[0]?.slug ?? 'bezopasnost');
    }
  }, [openSlug, sections]);

  if (sections.length === 0) {
    return <div style={{ padding: 20, fontSize: 13, color: 'var(--color-ink-4)' }}>Загрузка категорий...</div>;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 20px' }}>
      {LEFT_BLOCKS[0]?.links.length ? (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-hair)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-4)', marginBottom: 8 }}>
            Часто ищут
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LEFT_BLOCKS[0].links.map((link) => (
              <Link
                key={link.label}
                href={linkHref(link, bySlug)}
                onClick={onClose}
                style={{
                  padding: '6px 9px',
                  borderRadius: 999,
                  border: '1px solid var(--color-hair)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-ink-2)',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-hair)' }}>
        <PopularBrandStrip onClose={onClose} compact />
      </div>

      {sections.map((section) => {
        const isOpen = openSlug === section.slug;
        return (
          <div key={section.slug} style={{ borderBottom: '1px solid var(--color-hair)' }}>
            <button
              onClick={() => setOpenSlug(isOpen ? '' : section.slug)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 18px',
                border: 0,
                background: isOpen ? 'var(--color-surface-2)' : 'transparent',
                color: 'var(--color-ink)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 800, textTransform: 'uppercase' }}>{section.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-ink-4)', marginTop: 3, overflowWrap: 'anywhere' }}>{section.note}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CountBadge count={bySlug.get(section.slug)?.productCount ?? 0} compact />
                <span style={{ fontSize: 18, color: 'var(--color-ink-4)' }}>{isOpen ? '-' : '+'}</span>
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 18px 14px' }}>
                <Link
                  href={categoryHref(section.slug, bySlug)}
                  onClick={onClose}
                  style={{
                    display: 'block',
                    padding: '9px 0',
                    color: 'var(--color-accent)',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Весь раздел {section.name} →
                </Link>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))', gap: '2px 12px' }}>
                  {section.links.map((link) => {
                    const count = linkCount(link, bySlug, section.slug);
                    return (
                      <Link
                        key={link.label}
                        href={linkHref(link, bySlug, section.slug)}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                          minWidth: 0,
                          padding: '8px 0',
                          color: 'var(--color-ink-2)',
                          fontSize: 13,
                          lineHeight: 1.25,
                          textDecoration: 'none',
                        }}
                      >
                        <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{link.label}</span>
                        <CountBadge count={count} compact />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ padding: 16 }}>
        <Link href="/categories" onClick={onClose} className="btn btn-primary btn-block" style={{ height: 42, textDecoration: 'none' }}>
          Все категории →
        </Link>
      </div>
    </div>
  );
}
