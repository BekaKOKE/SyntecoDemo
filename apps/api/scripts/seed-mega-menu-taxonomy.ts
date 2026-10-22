import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChildCategorySeed {
  slug: string;
  name: string;
  keywords: string[];
}

interface RootCategorySeed {
  slug: string;
  name: string;
  children: ChildCategorySeed[];
}

const taxonomy: RootCategorySeed[] = [
  {
    slug: 'bezopasnost',
    name: 'Безопасность',
    children: [
      { slug: 'siz', name: 'СИЗ', keywords: ['ppe', 'personal protective', 'safety'] },
      { slug: 'zashchita-ruk', name: 'Защита рук', keywords: ['glove', 'hand protection', 'nitrile'] },
      { slug: 'zashchita-glaz', name: 'Защита глаз', keywords: ['safety glasses', 'goggles', 'eye protection'] },
      { slug: 'zashchita-slukha', name: 'Защита слуха', keywords: ['earplug', 'ear muff', 'hearing'] },
      { slug: 'respirators', name: 'Респираторы', keywords: ['respirator', 'mask', 'cartridge'] },
      { slug: 'fire-extinguishers', name: 'Огнетушители', keywords: ['extinguisher', 'fire'] },
      { slug: 'loto-locks', name: 'Замки LOTO', keywords: ['lockout', 'tagout', 'loto', 'padlock'] },
      { slug: 'spetsodezhda', name: 'Спецодежда', keywords: ['coverall', 'vest', 'workwear', 'clothing'] },
      { slug: 'znaki-bezopasnosti', name: 'Знаки и маркировка безопасности', keywords: ['safety sign', 'safety label', 'facility identification'] },
    ],
  },
  {
    slug: 'instrumenty',
    name: 'Инструменты',
    children: [
      { slug: 'elektroinstrumenty', name: 'Электроинструменты', keywords: ['drill', 'grinder', 'saw', 'cordless', 'power tool'] },
      { slug: 'ruchnoy-instrument', name: 'Ручной инструмент', keywords: ['wrench', 'pliers', 'screwdriver', 'hammer', 'socket'] },
      { slug: 'sverlenie', name: 'Сверление', keywords: ['drill bit', 'hole saw', 'bit set'] },
      { slug: 'izmeritelnyy-instrument', name: 'Измерительный инструмент', keywords: ['caliper', 'tape measure', 'level', 'meter'] },
      { slug: 'osnastka', name: 'Оснастка', keywords: ['tool holder', 'insert', 'chuck', 'collet'] },
      { slug: 'abrazivy', name: 'Абразивы', keywords: ['abrasive', 'sandpaper', 'grinding wheel', 'disc'] },
      { slug: 'nabory-instrumentov', name: 'Наборы инструментов', keywords: ['tool set', 'kit'] },
      { slug: 'instrumenty-obshchie', name: 'Прочие инструменты', keywords: ['industrial tool'] },
    ],
  },
  {
    slug: 'elektrika',
    name: 'Электрика',
    children: [
      { slug: 'kabeli', name: 'Кабели и провода', keywords: ['cable', 'wire', 'cord'] },
      { slug: 'razemy-klemmy', name: 'Разъемы и клеммы', keywords: ['connector', 'terminal', 'lug'] },
      { slug: 'shchity-korpusa', name: 'Щиты и корпуса', keywords: ['enclosure', 'panel', 'box'] },
      { slug: 'avtomaty-predohraniteli', name: 'Автоматы и предохранители', keywords: ['breaker', 'fuse'] },
      { slug: 'rele-kontaktory', name: 'Реле и контакторы', keywords: ['relay', 'contactor', 'starter'] },
      { slug: 'osveshchenie', name: 'Освещение', keywords: ['lamp', 'light', 'fixture', 'bulb'] },
      { slug: 'kabel-kanaly', name: 'Кабель-каналы', keywords: ['wire duct', 'raceway', 'conduit'] },
      { slug: 'kipia', name: 'КИПиА', keywords: ['sensor', 'control', 'automation', 'instrument'] },
      { slug: 'elektrika-obshchaya', name: 'Прочая электрика', keywords: ['electrical equipment'] },
    ],
  },
  {
    slug: 'pnevmatika',
    name: 'Пневматика',
    children: [
      { slug: 'pnevmo-tsilindry', name: 'Пневмоцилиндры', keywords: ['air cylinder', 'pneumatic cylinder'] },
      { slug: 'pnevmo-instrument', name: 'Пневмоинструмент', keywords: ['air tool', 'pneumatic tool'] },
      { slug: 'pnevmo-klapany', name: 'Пневмоклапаны', keywords: ['pneumatic valve', 'air valve'] },
      { slug: 'kompressory', name: 'Компрессоры', keywords: ['compressor'] },
      { slug: 'podgotovka-vozduha', name: 'Подготовка воздуха', keywords: ['filter regulator', 'lubricator', 'air treatment'] },
      { slug: 'pnevmo-fitingi', name: 'Пневмофитинги', keywords: ['pneumatic fitting', 'push-to-connect'] },
      { slug: 'pnevmo-shlangi', name: 'Пневмошланги', keywords: ['air hose', 'pneumatic tubing'] },
      { slug: 'pnevmatika-obshchaya', name: 'Прочая пневматика', keywords: ['pneumatic equipment'] },
    ],
  },
  {
    slug: 'gidravlika',
    name: 'Гидравлика',
    children: [
      { slug: 'gidro-tsilindry', name: 'Гидроцилиндры', keywords: ['hydraulic cylinder'] },
      { slug: 'gidro-nasosy', name: 'Гидронасосы', keywords: ['hydraulic pump'] },
      { slug: 'gidro-klapany', name: 'Гидроклапаны', keywords: ['hydraulic valve'] },
      { slug: 'gidro-fitingi', name: 'Гидрофитинги', keywords: ['hydraulic fitting', 'adapter'] },
      { slug: 'gidro-rukava', name: 'Гидрорукава', keywords: ['hydraulic hose'] },
      { slug: 'gidro-uplotneniya', name: 'Гидроуплотнения', keywords: ['hydraulic seal', 'o-ring'] },
      { slug: 'gidro-instrument', name: 'Гидроинструмент', keywords: ['hydraulic tool', 'puller'] },
      { slug: 'gidravlika-obshchaya', name: 'Прочая гидравлика', keywords: ['hydraulic equipment'] },
    ],
  },
  {
    slug: 'krepezh',
    name: 'Крепеж',
    children: [
      { slug: 'bolty-vinty', name: 'Болты и винты', keywords: ['bolt', 'screw'] },
      { slug: 'gayki', name: 'Гайки', keywords: ['nut'] },
      { slug: 'shayby', name: 'Шайбы', keywords: ['washer'] },
      { slug: 'ankery', name: 'Анкеры', keywords: ['anchor'] },
      { slug: 'shtifty', name: 'Штифты', keywords: ['pin', 'dowel'] },
      { slug: 'pruzhiny', name: 'Пружины', keywords: ['spring'] },
      { slug: 'uplotneniya', name: 'Уплотнения', keywords: ['seal', 'gasket', 'o-ring'] },
      { slug: 'rezbovye-vstavki', name: 'Резьбовые вставки', keywords: ['thread insert', 'helicoil'] },
      { slug: 'krepezh-obshchiy', name: 'Прочий крепёж', keywords: ['fastener'] },
    ],
  },
  {
    slug: 'santekhnika',
    name: 'Сантехника',
    children: [
      { slug: 'truby-fitingi', name: 'Трубы и фитинги', keywords: ['pipe', 'fitting', 'tube'] },
      { slug: 'klapany', name: 'Клапаны', keywords: ['valve'] },
      { slug: 'nasosy', name: 'Насосы', keywords: ['pump'] },
      { slug: 'shlangi-rukava', name: 'Шланги и рукава', keywords: ['hose'] },
      { slug: 'filtratsiya', name: 'Фильтрация', keywords: ['filter', 'strainer'] },
      { slug: 'hvac', name: 'HVAC', keywords: ['hvac', 'refrigeration'] },
      { slug: 'ventilyatsiya', name: 'Вентиляция', keywords: ['fan', 'blower', 'ventilation'] },
      { slug: 'santeh-uplotneniya', name: 'Сантехнические уплотнения', keywords: ['gasket', 'seal'] },
      { slug: 'santekhnika-obshchaya', name: 'Прочая сантехника', keywords: ['plumbing equipment'] },
    ],
  },
  {
    slug: 'dvigateli',
    name: 'Двигатели',
    children: [
      { slug: 'ac-dvigateli', name: 'AC-двигатели', keywords: ['ac motor', 'electric motor'] },
      { slug: 'motor-reduktory', name: 'Мотор-редукторы', keywords: ['gearmotor', 'gear motor'] },
      { slug: 'privody', name: 'Приводы', keywords: ['drive', 'vfd'] },
      { slug: 'kondensatory', name: 'Конденсаторы', keywords: ['capacitor'] },
      { slug: 'remni', name: 'Ремни', keywords: ['belt'] },
      { slug: 'mufty', name: 'Муфты', keywords: ['coupling'] },
      { slug: 'obsluzhivanie-dvigateley', name: 'Обслуживание двигателей', keywords: ['motor maintenance', 'brush'] },
    ],
  },
  {
    slug: 'podshipniki',
    name: 'Подшипники',
    children: [
      { slug: 'podshipniki-main', name: 'Подшипники', keywords: ['bearing'] },
      { slug: 'remni-shkivy', name: 'Ремни и шкивы', keywords: ['belt', 'pulley'] },
      { slug: 'tsepi-zvezdochki', name: 'Цепи и звездочки', keywords: ['chain', 'sprocket'] },
      { slug: 'mufty-valy', name: 'Муфты', keywords: ['coupling'] },
      { slug: 'valy', name: 'Валы', keywords: ['shaft'] },
      { slug: 'lineynoe-peremeshchenie', name: 'Линейное перемещение', keywords: ['linear motion', 'linear bearing'] },
      { slug: 'uplotneniya-valov', name: 'Уплотнения валов', keywords: ['shaft seal'] },
      { slug: 'transmissiya-obshchaya', name: 'Прочие элементы трансмиссии', keywords: ['power transmission'] },
    ],
  },
  {
    slug: 'upakovka',
    name: 'Упаковка',
    children: [
      { slug: 'korobki-tara', name: 'Коробки и тара', keywords: ['box', 'carton', 'container'] },
      { slug: 'skotch-lenty', name: 'Скотч и ленты', keywords: ['tape'] },
      { slug: 'stropy', name: 'Стропы', keywords: ['strap', 'strapping', 'sling'] },
      { slug: 'markirovka', name: 'Маркировка', keywords: ['label', 'marker'] },
      { slug: 'skladskoe-hranenie', name: 'Складское хранение', keywords: ['shelf', 'rack', 'storage'] },
      { slug: 'telezhki', name: 'Тележки', keywords: ['cart', 'truck', 'dolly'] },
      { slug: 'podem-peremeshchenie', name: 'Подъем и перемещение', keywords: ['lifting', 'hoist', 'puller'] },
      { slug: 'upakovka-obshchaya', name: 'Прочая упаковка', keywords: ['packaging supplies'] },
    ],
  },
  {
    slug: 'laboratoriya',
    name: 'Лаборатория',
    children: [
      { slug: 'izmeritelnye-pribory', name: 'Измерительные приборы', keywords: ['meter', 'tester', 'gauge'] },
      { slug: 'konteynery-emkosti', name: 'Контейнеры и емкости', keywords: ['beaker', 'bottle', 'container'] },
      { slug: 'laboratornoe-oborudovanie', name: 'Лабораторное оборудование', keywords: ['lab equipment', 'microscope'] },
      { slug: 'laboratornye-filtry', name: 'Лабораторные фильтры', keywords: ['filter paper', 'sieve'] },
      { slug: 'laboratornaya-mebel', name: 'Лабораторная мебель', keywords: ['lab bench', 'cabinet'] },
      { slug: 'laboratornaya-ventilyatsiya', name: 'Лабораторная вентиляция', keywords: ['fume hood', 'ventilation'] },
      { slug: 'temperaturnyy-kontrol', name: 'Температурный контроль', keywords: ['thermometer', 'temperature'] },
    ],
  },
  {
    slug: 'uborka',
    name: 'Уборка',
    children: [
      { slug: 'inventar', name: 'Инвентарь', keywords: ['mop', 'broom', 'brush'] },
      { slug: 'professionalnaya-himiya', name: 'Профессиональная химия', keywords: ['cleaner', 'detergent', 'degreaser'] },
      { slug: 'musor-pererabotka', name: 'Мусор и переработка', keywords: ['trash', 'waste', 'recycling'] },
      { slug: 'bumaga-salfetki', name: 'Бумага и салфетки', keywords: ['paper towel', 'wipe', 'tissue'] },
      { slug: 'dozatory', name: 'Дозаторы', keywords: ['dispenser'] },
      { slug: 'polomoechnye-mashiny', name: 'Поломоечные машины', keywords: ['floor machine', 'scrubber'] },
    ],
  },
  {
    slug: 'avtopark',
    name: 'Автопарк',
    children: [
      { slug: 'avto-filtry', name: 'Автофильтры', keywords: ['vehicle filter', 'oil filter', 'air filter'] },
      { slug: 'akb-elektrika', name: 'АКБ и электрика', keywords: ['battery', 'charger', 'jump starter'] },
      { slug: 'masla-smazki', name: 'Масла и смазки', keywords: ['oil', 'lubricant', 'grease'] },
      { slug: 'shiny-tormoza', name: 'Шины и тормоза', keywords: ['tire', 'brake'] },
      { slug: 'pricepnoe-oborudovanie', name: 'Прицепное оборудование', keywords: ['trailer', 'towing'] },
      { slug: 'garazhnoe-oborudovanie', name: 'Гаражное оборудование', keywords: ['jack', 'garage'] },
      { slug: 'avtoinstrument', name: 'Автоинструмент', keywords: ['automotive tool', 'vehicle tool'] },
      { slug: 'avtopark-obshchiy', name: 'Прочие товары для автопарка', keywords: ['fleet maintenance'] },
    ],
  },
  {
    slug: 'svarka',
    name: 'Сварка',
    children: [
      { slug: 'elektrody-provoloka', name: 'Электроды и проволока', keywords: ['electrode', 'welding wire', 'filler metal'] },
      { slug: 'gazovoe-oborudovanie', name: 'Газовое оборудование', keywords: ['gas regulator', 'torch', 'cylinder'] },
      { slug: 'svarochnye-apparaty', name: 'Сварочные аппараты', keywords: ['welder', 'welding machine'] },
      { slug: 'payka', name: 'Пайка', keywords: ['solder', 'brazing'] },
      { slug: 'zaschita-svarshchika', name: 'Защита сварщика', keywords: ['welding helmet', 'welding glove'] },
      { slug: 'shpilkosvarka', name: 'Шпилькосварка', keywords: ['stud welding'] },
      { slug: 'svarka-obshchaya', name: 'Прочие сварочные товары', keywords: ['welding supplies'] },
    ],
  },
  {
    slug: 'syrye-materialy',
    name: 'Сырьё и материалы',
    children: [
      { slug: 'metalloprokat', name: 'Металлопрокат', keywords: ['steel', 'aluminum', 'copper', 'brass', 'bronze'] },
      { slug: 'rezina-penomaterialy', name: 'Резина и пеноматериалы', keywords: ['rubber', 'foam'] },
      { slug: 'plastiki', name: 'Пластики', keywords: ['plastic', 'pvc', 'polyethylene'] },
      { slug: 'kompozity-tehnicheskie-tkani', name: 'Композиты и технические ткани', keywords: ['fiberglass', 'composite', 'technical fabric'] },
    ],
  },
  {
    slug: 'mebel-i-hoztovary',
    name: 'Мебель и хозяйственные товары',
    children: [
      { slug: 'promyshlennaya-mebel', name: 'Промышленная мебель', keywords: ['furniture', 'cabinet', 'chair'] },
      { slug: 'obustroystvo-pomeshcheniy', name: 'Обустройство помещений', keywords: ['window treatment', 'flooring', 'doors'] },
      { slug: 'gostinichnye-tovary', name: 'Гостиничные товары', keywords: ['hospitality', 'housekeeping'] },
      { slug: 'obshchepit', name: 'Общепит', keywords: ['food service', 'tableware', 'cookware'] },
      { slug: 'sportivnyy-inventar', name: 'Спортивный инвентарь', keywords: ['fitness', 'sport', 'exercise'] },
      { slug: 'bytovaya-tehnika-zapchasti', name: 'Бытовая техника и запчасти', keywords: ['appliance', 'replacement part'] },
    ],
  },
  {
    slug: 'promyshlennaya-furnitura',
    name: 'Промышленная фурнитура',
    children: [
      { slug: 'dvernaya-furnitura', name: 'Дверная и оконная фурнитура', keywords: ['door hardware', 'window hardware', 'hinge', 'handle'] },
      { slug: 'vibroopory', name: 'Виброопоры', keywords: ['vibration mount', 'leveling mount'] },
      { slug: 'zaglushki-kolpachki', name: 'Заглушки и колпачки', keywords: ['cap', 'plug'] },
      { slug: 'kryuki-zashchelki', name: 'Крюки и защёлки', keywords: ['hook', 'hasp', 'latch'] },
      { slug: 'poruchni-zashchita-sten', name: 'Поручни и защита стен', keywords: ['handrail', 'wall protection', 'corner guard'] },
      { slug: 'promyshlennaya-furnitura-obshchaya', name: 'Общая фурнитура', keywords: ['industrial hardware'] },
      { slug: 'zapchasti-i-komplektuyushchie', name: 'Запчасти и комплектующие', keywords: ['spare parts', 'replacement kit'] },
    ],
  },
  {
    slug: 'ofisnye-tovary',
    name: 'Офисные товары',
    children: [
      { slug: 'kancelyariya', name: 'Канцелярия', keywords: ['paper', 'pen', 'pencil', 'marker', 'clipboard'] },
      { slug: 'rashodniki-dlya-pechati', name: 'Расходники для печати', keywords: ['ink', 'toner', 'printer'] },
      { slug: 'kompyuternye-aksessuary', name: 'Компьютерные аксессуары', keywords: ['computer supplies', 'tablet holder'] },
      { slug: 'ofisnoe-oborudovanie', name: 'Офисное оборудование', keywords: ['office equipment'] },
    ],
  },
  {
    slug: 'ohrannye-sistemy',
    name: 'Охранные системы',
    children: [
      { slug: 'zamki-i-klyuchi', name: 'Замки и ключи', keywords: ['lock', 'key blank'] },
      { slug: 'videonablyudenie', name: 'Видеонаблюдение', keywords: ['camera', 'video surveillance', 'recorder'] },
      { slug: 'kontrol-dostupa', name: 'Контроль доступа', keywords: ['turnstile', 'gate', 'access control'] },
      { slug: 'identifikatsiya', name: 'Идентификация', keywords: ['id card', 'badge', 'wristband'] },
      { slug: 'sluzhebnaya-bezopasnost', name: 'Служебная безопасность', keywords: ['law enforcement', 'radio', 'holster'] },
      { slug: 'ohrannoe-oborudovanie', name: 'Охранное оборудование', keywords: ['security equipment'] },
    ],
  },
  {
    slug: 'lakokrasochnye-materialy',
    name: 'Лакокрасочные материалы',
    children: [
      { slug: 'kraski-pokrytiya', name: 'Краски и покрытия', keywords: ['paint', 'coating', 'primer'] },
      { slug: 'malyarnyy-instrument', name: 'Малярный инструмент', keywords: ['paint brush', 'tray', 'applicator'] },
      { slug: 'okrasochnoe-oborudovanie', name: 'Окрасочное оборудование', keywords: ['spray gun', 'spray system'] },
    ],
  },
  {
    slug: 'ulichnoe-oborudovanie',
    name: 'Уличное оборудование',
    children: [
      { slug: 'sadovyy-instrument', name: 'Садовый инструмент', keywords: ['outdoor tool', 'chainsaw', 'saw'] },
      { slug: 'moyki-vysokogo-davleniya', name: 'Мойки высокого давления', keywords: ['pressure washer'] },
      { slug: 'snegouborka', name: 'Снегоуборка', keywords: ['snow', 'ice removal'] },
      { slug: 'malye-dvigateli', name: 'Малые двигатели', keywords: ['small engine'] },
      { slug: 'borba-s-vreditelyami', name: 'Борьба с вредителями', keywords: ['pest control', 'rodent'] },
    ],
  },
];

async function main() {
  const categoryBySlug = new Map<string, { id: string; slug: string; path: string }>();
  let createdOrUpdated = 0;

  for (const [rootIndex, rootSeed] of taxonomy.entries()) {
    const root = await prisma.category.upsert({
      where: { slug: rootSeed.slug },
      update: { name: rootSeed.name, parentId: null, level: 1, path: rootSeed.slug, sortOrder: rootIndex + 1 },
      create: {
        name: rootSeed.name,
        slug: rootSeed.slug,
        path: rootSeed.slug,
        level: 1,
        sortOrder: rootIndex + 1,
      },
      select: { id: true, slug: true, path: true },
    });
    categoryBySlug.set(root.slug, root);
    createdOrUpdated += 1;

    for (const [childIndex, childSeed] of rootSeed.children.entries()) {
      const child = await prisma.category.upsert({
        where: { slug: childSeed.slug },
        update: {
          name: childSeed.name,
          parentId: root.id,
          level: 2,
          path: `${rootSeed.slug}.${childSeed.slug}`,
          sortOrder: childIndex + 1,
        },
        create: {
          name: childSeed.name,
          slug: childSeed.slug,
          parentId: root.id,
          level: 2,
          path: `${rootSeed.slug}.${childSeed.slug}`,
          sortOrder: childIndex + 1,
        },
        select: { id: true, slug: true, path: true },
      });
      categoryBySlug.set(child.slug, child);
      createdOrUpdated += 1;
    }
  }

  let countsUpdated = 0;
  for (const category of categoryBySlug.values()) {
    const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(DISTINCT pc.product_id)::bigint AS count
      FROM "product"."product_categories" pc
      JOIN "product"."categories" c ON c.id = pc.category_id
      JOIN "product"."products" p ON p.id = pc.product_id
      WHERE (c.path::text = ${category.path} OR c.path::text LIKE ${`${category.path}.%`})
        AND p.availability <> 'discontinued'
    `);
    const count = Number(rows[0]?.count ?? 0n);
    await prisma.category.update({
      where: { id: category.id },
      data: { productCount: count },
    });
    countsUpdated += 1;
  }

  console.log(
    `Mega Menu taxonomy ready: ${createdOrUpdated} categories upserted, ${countsUpdated} counts refreshed. Product classification is handled by rebuild-catalog-categories.ts.`,
  );
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
