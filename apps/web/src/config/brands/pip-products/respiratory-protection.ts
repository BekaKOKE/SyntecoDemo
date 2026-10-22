import type { BrandProduct } from '../types';
import { buildProducts, type ProductRow, type ProductTables } from './build';

/**
 * PIP Respiratory Protection products — disposable N95/P95 respirators,
 * North(R) and Force Typhoon(TM) reusable facepieces, filters, cartridges
 * and supplied-air kit, mirrored from
 * https://us.pipglobal.com/en/products/?scID=2566
 *
 * Names and catalog numbers stay in English: buyers search by PIP
 * nomenclature. Only the descriptions are localised.
 *
 * Generated — do not edit by hand.
 */

const SC_ID = 2566;

const TABLES: ProductTables = {
  /** Russian card copy, shared between products of the same family. */
  descriptions: {
    128: "Одноразовая маска на нос и рот, фиксируется под подбородком, со складками для раскрытия.",
    129: "Одноразовые респираторы 270-RPD713N95 и 270-RPD714N95 — рабочая лошадка на каждый день. Подходят, когда маску нужно носить долго. С клапаном выдоха и без. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    130: "Базовая защита от пыли, тумана и дыма без лишних затрат. Для эпизодического использования и лёгких работ. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    131: "Подходит, когда маску нужно носить долго. С клапаном выдоха и без. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    132: "270-RPD513N95 даёт базовую защиту от пыли, тумана и дыма без лишних затрат. Для эпизодического использования и лёгких работ. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    133: "Складная плоская одноразовая маска SpringFit™ садится на лицо исключительно плотно за счёт уникального внутреннего каркаса. Множество решений, максимизирующих посадку, комфорт, совместимость и рабочие характеристики.",
    134: "Контурная форма даёт максимальный обзор даже в очках и не мешает дышать и говорить. Регулируемая металлическая полоска на носу для правильной посадки. Две эластичные ленты без латекса удерживают респиратор на лице.",
    135: "Одноразовый респиратор 270-RPD714N95OAO — рабочая лошадка на каждый день. Подходит, когда маску нужно носить долго. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    136: "Для грязной работы нужен соответствующий респиратор: 270-RPD614P95 и 270-RPD814P95. Класс P95 с одобрением NIOSH, для сред с масляными аэрозолями.",
    137: "Для грязной работы нужен соответствующий респиратор: 270-RPD614P95, 270-RPD814P95 и 270-RPD814P95OA. Класс P95 с одобрением NIOSH, для сред с масляными аэрозолями.",
    138: "Главное — портативность. Плоскоскладной респиратор помещается в карман, стопкой в сумку или под каску — всегда под рукой, когда маска нужна прямо сейчас. Каждый упакован индивидуально. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    139: "Главное — портативность. Плоскоскладной респиратор помещается в карман, стопкой в сумку или под каску — всегда под рукой, когда маска нужна прямо сейчас. Каждый упакован индивидуально. Класс N95 с одобрением NIOSH, для безмасляных сред.",
    140: "Одноразовая противопылевая маска North 14110094CC SAF-T-FIT®: лёгкая, для базовой защиты от нетоксичной пыли, пыльцы, плесени и шерсти. Фильтрующий материал из 100% полиэстера, регулируемый металлический носовой зажим улучшает прилегание. Эластичное крепление — простое и надёжное надевание.",
    141: "Загубный респиратор для аварийной эвакуации под кислые газы (хлор, диоксид хлора, хлористый водород, сероводород, фтористый водород, диоксид серы). В комплекте один респиратор с клипсой на пояс. Серия 7900 — быстрый и недорогой способ выйти из аварийной зоны, не относящейся к IDLH: как «эвакуационное устройство для посетителей» или личное средство на случай утечки.",
    142: "Эвакуационный капюшон NIOSH CAP 2 даёт не менее 30 минут на выход при многих загрязнениях. Двухпатронная схема эргономично сбалансирована. Прозрачный капюшон не вызывает клаустрофобии, контурная бутиловая шейная манжета упрощает надевание. Для эвакуации при промышленных разливах и авариях, терактах и в других опасных средах.",
    143: "Загубный респиратор для аварийной эвакуации, силикон, против аммиака и метиламина, для серии 7900. Серия 7900 — быстрый и недорогой способ выйти из аварийной зоны, не относящейся к IDLH: как «эвакуационное устройство для посетителей» или личное средство на случай химической утечки.",
    144: "Небольшая нейлоновая сумка для респираторов Hydroshield® с застёжкой-липучкой и шлёвками под ремень.",
    145: "Многоцелевой патрон Defender™ с фильтром P100: одобрен NIOSH против органических паров, аммиака, метиламина, формальдегида и кислых газов (хлор, хлористый водород, диоксид серы, сероводород, фтористый водород, диоксид хлора), плюс фильтр P100 (эффективность не ниже 99,97%) от всех аэрозолей.",
    146: "Полумаска Force Typhoon™ 8 с двумя фильтрами и клапаном Typhoon™: комфорт на всю смену и очень низкое сопротивление дыханию. Принимает фильтры PressToCheck™ на байонете с поворотом на четверть. Область применения зависит от выбранных фильтров и патронов.",
    147: "Парные фильтры PressToCheck™ дают Daily Face Fit Reassurance™ — перед каждым входом в опасную зону можно мгновенно проверить, что маска села герметично.",
    148: "Эталон среди полумасок. Полностью из силикона премиального класса: широкая зона прилегания даёт исключительную посадку и комфорт. Подвеска-люлька с ткаными лямками сохраняет подвижность без потери фиксации. Легко переводится в режим PAPR или подачи воздуха.",
    149: "Противоаэрозольный фильтр P100 (эффективность не ниже 99,97%) от всех аэрозолей.",
    150: "Самая комфортная маска в линейке. Двойная уплотнительная кромка из силикона премиального класса даёт удобную посадку и оптимальное прилегание к лицу. Также: широкий обзор, пятиточечное оголовье и подбородочная опора.",
    151: "Force Typhoon™ F-5000 — патрон нового поколения с минимальным сопротивлением вдоху. Патрон F-51V0 работает против органических паров. Полностью совместим с полумасками Force Typhoon™ 8, доступными в нескольких размерах.",
    152: "Эластомерная полумаска — экономичное решение без ущерба функционалу. Широкая контурная зона прилегания даёт хорошую посадку. Малое «мёртвое» пространство ограничивает повторное вдыхание выдохнутого воздуха. Лямки без латекса тянутся вместе с движениями и держат маску.",
    153: "Качественный фит-тест применим к плотно прилегающим респираторам, кроме полнолицевых масок. Это не только способ убедиться, что люди защищены, но и хороший метод научить их правильно надевать маску.",
    154: "Полнолицевая маска из термопластичного эластомера с четырёхточечным оголовьем. Лучшее соотношение цены и качества среди полнолицевых масок: носовая чашка и широкий обзор в базовой комплектации. Модель 5400 легко переводится в PAPR или систему с подачей воздуха.",
    155: "Патрон, одобренный NIOSH для защиты от органических паров (OV).",
    156: "Патрон, одобренный NIOSH против органических паров и кислых газов (хлор, хлористый водород, диоксид серы, фтористый водород, диоксид хлора), с фильтром P100 (99,97%) от всех аэрозолей.",
    157: "Комфорт для людей и для бюджета. Силиконовая полнолицевая маска North RU6500 даёт комфорт на всю смену по хорошей цене. Адаптируется под боковое и фронтальное подключение CF-SAR и PAPR — не нужно проводить фит-тест на нескольких респираторах.",
    158: "Патрон, одобренный NIOSH против органических паров, с фильтром P100 (эффективность не ниже 99,97%) от всех аэрозолей.",
    159: "Force Typhoon™ F-1000 — компактные фильтры нового поколения для большего комфорта. Фильтр F-1104 P100 одобрен NIOSH: эффективность от 99,97% против масляных и безмасляных аэрозолей, с защитой от органических паров на уровне неприятных концентраций. Совместим с полумасками Force Typhoon™ 8.",
    160: "Адаптер Force® Portacount / AccuFIT для количественного фит-теста: подключает респираторы Force® к оборудованию TSI Portacount и AccuFIT.",
    161: "Force Typhoon™ F-5005 — новое поколение с минимальным сопротивлением вдоху. Противоаэрозольные фильтры F-5005 защёлкиваются на патрон F-51V0 через многоразовый держатель (продаётся отдельно), добавляя защиту от аэрозолей. Совместимы с полумаской Force Typhoon™ 8.",
    162: "Полнолицевая маска из термопластичного эластомера с четырёхточечным оголовьем и сварочной насадкой. Носовая чашка и широкий обзор в базовой комплектации. Модель 5400 легко переводится в PAPR или систему с подачей воздуха.",
    163: "Самая комфортная маска в линейке плюс сварочная насадка под разные задачи. Двойная уплотнительная кромка из силикона премиального класса даёт удобную посадку и оптимальное прилегание. Также: широкий обзор, пятиточечное оголовье и подбородочная опора.",
    164: "Линейка Force Typhoon™ F-5005 — новое поколение с минимальным сопротивлением вдоху. Противоаэрозольные фильтры F-5005 защёлкиваются на патрон F-51V0 и добавляют защиту от аэрозолей. Совместимы с полумаской Force Typhoon™ 8.",
    165: "Фильтры Force Typhoon™ F-1000 компактны и легки. Сверхнизкий профиль даёт широкий обзор и совместимость с щитками, сварочными масками и другими СИЗ. Фильтры F-1004 разработаны так, чтобы минимизировать сопротивление вдоху: увеличенная площадь повышает поток воздуха и снижает усталость.",
    166: "Таблица размеров лица поможет выбрать Force Typhoon™ 8 в размере S, M или L для наилучшего прилегания. С фильтрами PressToCheck™ вы получаете Daily Face Fit Reassurance™ — простую проверку герметичности перед каждым использованием.",
    167: "«Блин» с защитой от запаха: низкопрофильный фильтр P100 (не ниже 99,97%) от всех аэрозолей плюс защита от неприятных концентраций органических паров, газов и озона.",
    168: "Многоцелевой патрон Defender™: одобрен NIOSH против органических паров, аммиака, метиламина, формальдегида и кислых газов (хлор, хлористый водород, диоксид серы, фтористый водород, диоксид хлора).",
    169: "Патрон, одобренный NIOSH против органических паров и кислых газов (хлор, хлористый водород, диоксид серы, фтористый водород, диоксид хлора).",
    170: "Патрон, одобренный NIOSH против паров ртути и хлора, с индикатором отработки ресурса (ESLI) по ртути и фильтром P100 (не ниже 99,97%) от всех аэрозолей.",
    171: "«Блин»: низкопрофильный фильтр P100 (не ниже 99,97%) от всех аэрозолей.",
    172: "RU8500 — одна из немногих многоразовых полумасок с речевой мембраной: слышимость лучше, и людям не нужно выходить из зоны или снимать маску, чтобы что-то сказать. Мягкий гибкий силикон даёт комфорт на часы работы, двойная уплотнительная кромка — отличное прилегание.",
    173: "Полумаска North RU8800 спроектирована специально под тех, кому трудно подобрать маску. Охватывающий профиль повторяет форму лица, складки корпуса направляют маску к лицу, а тройная кромка с тремя уплотнительными поверхностями держит герметичность при свободе движений.",
    174: "Фильтры, лицевые части и патроны продаются отдельно. Настраиваемая этикетка помогает закрепить средство за конкретным работником. Многоразовый контейнер вмещает одну лицевую часть и пару фильтров или патронов.",
    175: "Патрон, одобренный NIOSH против аммиака и метиламина.",
    176: "Для использования с набором фит-теста Bitrex. Ламинированный, с прозрачным смотровым окном.",
    177: "Противоаэрозольный фильтр North 7506R95 класса R95 для тяжёлых промышленных условий: эффективность не ниже 95% против аэрозолей, включая масляные и безмасляные, — универсальный вариант там, где требования к безопасности повышены.",
    178: "Патрон против паров ртути и хлора с индикатором отработки ресурса (ESLI) по ртути.",
    179: "Полная линейка фильтров и патронов серии N для защиты в самых разных опасных средах. Для полумасок и полнолицевых масок North.",
    180: "Комбинированный патрон North 7582P100L: фильтрация кислых газов плюс аэрозольная защита класса P100 (99,97%). Защищает от хлора, хлористого водорода, диоксида серы, фтористого водорода, диоксида хлора и формальдегида, одновременно задерживая аэрозоли.",
    181: "Комплект оправы для полнолицевого респиратора: проволочная пружинная вставка под корригирующие линзы.",
    182: "Для полнолицевых масок серии 5400: одноразовые защитные плёнки на стекло — просто снимите и выбросьте.",
    183: "Сварочная насадка превращает полнолицевую маску в респиратор для сварочных работ.",
    184: "Большая нейлоновая сумка для полнолицевых респираторов с застёжкой-липучкой и шлёвками под ремень.",
    185: "Сменные стёкла для полнолицевых респираторов взамен изношенных или повреждённых — чтобы обзор оставался чистым.",
    186: "Средняя нейлоновая сумка для полумасок с застёжкой-липучкой и шлёвками под ремень.",
    187: "Полная линейка фильтров и патронов серии N для защиты в самых разных опасных средах. Для полумасок и полнолицевых масок North.",
    188: "Комбинация патрона и фильтра North 7584P100L: защита от аммиака и метиламина плюс аэрозольная защита класса P100. Задерживает масляные и безмасляные аэрозоли с эффективностью 99,97% через встроенный элемент P100.",
    189: "Держатель фильтра North® N750036 фиксирует предфильтры на газо-паровых патронах совместимых респираторов North®. Удерживает фильтры 7506N95, 7506N99 и 7506R95 на месте, сохраняя целостность системы защиты органов дыхания.",
    190: "Сменные трубки.",
    191: "N750035 — низкопрофильный адаптер специально для North 75FFP100NL и 75FFP100. С ним можно добавить фильтр P100 к патрону, у которого нет противоаэрозольного элемента. Фильтры продаются отдельно.",
    192: "Комбинированный патрон North 7583P100BL: защита от органических паров и кислых газов плюс высокоэффективный фильтр P100. Задерживает органические пары, хлор, хлористый водород, диоксид серы, фтористый водород, сероводород, диоксид хлора и аэрозоли с эффективностью не ниже 99,97%.",
    193: "Дождевой колпак North N750029 для фильтра 7580P100 и комбинаций «газ/пар + P100»: защищает фильтр от брызг воды при работах по удалению загрязнений и деконтаминации, а также от искр и шлака при сварке и шлифовке.",
    194: "Сборка капюшона North® PA121 Primair 100 с пелериной: капюшон из Tychem™ с покрытием, регулируемое оголовье и длина, козырёк из сополиэфира и упаковка из 3 отрывных защитных плёнок Mylar.",
    195: "Сборка капюшона North® PA111 Primair 100 с пелериной: капюшон с полиэтиленовым покрытием, регулируемое оголовье и длина, козырёк из сополиэфира и упаковка из 3 отрывных защитных плёнок Mylar.",
    196: "Превращает полумаски серий 5500 и 7700 и полнолицевые маски серий 5400 и 7600 в респиратор с непрерывной подачей воздуха. Подключается к разъёмам патронов быстро и без инструмента.",
    197: "North® 86610 обслуживает систему из двух плотно прилегающих лицевых частей или одного капюшона.",
    198: "Магистраль непрерывной подачи воздуха для капюшонов North Primair. В комплекте пластиковый дыхательный шланг 34 дюйма с разъёмом под капюшоны Primair и ПВХ-ремень.",
    199: "Капюшоны Free Aire обеспечивают эффективную защиту и комфорт в разных промышленных задачах. Изготовлены из дышащей ткани, со встроенным козырьком. Одноразовые — деконтаминация после использования не нужна.",
    200: "Чёрный шланг подачи дыхательного воздуха 15 м, внутренний диаметр 3/8 дюйма — обеспечивает непрерывный поток.",
    201: "Отрывные защитные плёнки для капюшонов серии Primair 100 и FM 100: легко снять и заменить, когда износ ухудшает обзор.",
  },
  /** Russian application tags. */
  applications: {
    0: [],
  },
};

const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);

/** ccID 11571 — 17 products. */
export const disposableMasks: BrandProduct[] = build([
  [11571, "18075", "PIP®", "Disposable Face Mask - 50 Pack", "270-4000", "/archive/pim/300/3/270-4000---FR2.jpg", 128, 0, "OS", "Light Blue", 1],
  [11571, "92498", "Dynamic™", "Deluxe N95 Disposable Respirator with Valve - 10 Pack", "270-RPD714N95", "/archive/pim/300/11/270-RPD714N95---F---NO STRAPS.jpg", 129, 0, "OS", "White", 1],
  [11571, "102430", "Dynamic™", "Standard N95 Disposable Respirator - 10 Pack", "270-RPD514N95", "/archive/pim/300/11/270-RPD514N95---F---NO STRAPS.jpg", 130, 0, "OS", "White", 1],
  [11571, "144756", "JSP®", "Premium N95 Disposable Respirator with Valve - 10 Pack", "272-RPD725N95", "/archive/pim/300/10/272-RPD725N95---F.jpg", 131, 0, "OS", "White", 1],
  [11571, "102429", "Dynamic™", "Standard N95 Disposable Respirator - 20 Pack", "270-RPD513N95", "/archive/pim/300/11/270-RPD513N95---F---NO STRAPS.jpg", 132, 0, "OS", "White", 1],
  [11571, "144757", "JSP® Springfit™", "Premium N95 Flat Fold Disposable Respirator - 10 Pack", "272-RPD421N95", "/archive/pim/300/10/272-RPD421N95---F.jpg", 133, 0, "OS", "White", 1],
  [11571, "102453", "Dynamic™", "Dust Mask - 50 Pack", "270-RP1000", "/archive/pim/300/7/RP1000---F----WITH STRAP.jpg", 134, 0, "OS", "White", 1],
  [11571, "144755", "JSP®", "Premium N95 Disposable Respirator - 20 Pack", "272-RPD721N95", "/archive/pim/300/10/272-RPD721N95---F.jpg", 131, 0, "OS", "White", 1],
  [11571, "102431", "Dynamic™", "Deluxe N95 Disposable Respirator with Butterfly Valve, Nuisance Level for OV-AG-Ozone and FR Material - 10 Pack", "270-RPD714N95OAO", "/archive/pim/300/6/RPD714N95OAO.jpg", 135, 0, "OS", "White", 1],
  [11571, "92494", "Dynamic™", "Deluxe N95 Disposable Respirator - 20 Pack", "270-RPD713N95", "/archive/pim/300/11/270-RPD713N95---F---NO STRAPS.jpg", 129, 0, "OS", "White", 1],
  [11571, "144758", "JSP® Springfit™", "Premium N95 Flat Fold Disposable Respirator with Valve - 10 Pack", "272-RPD425N95", "/archive/pim/300/10/272-RPD425N95---F.jpg", 133, 0, "OS", "White", 1],
  [11571, "102449", "Dynamic™", "P95 Disposable Respirator with Valve - 10 Pack", "270-RPD814P95", "/archive/pim/300/6/RPD814P95.jpg", 136, 0, "OS", "White", 1],
  [11571, "102451", "Dynamic™", "P95 Disposable Respirator, Nuisance OV-AG with Valve - 5 Pack", "270-RPD814P95OA", "/archive/pim/300/7/RPD814P95OA---F---WITH STRAP.jpg", 137, 0, "OS", "White", 1],
  [11571, "102447", "Dynamic™", "N95 Flatfold Disposable Respirator with Exhale Butterfly Valve - 10 Pack", "270-RPD724N95", "/archive/pim/300/6/RPD724N95.jpg", 138, 0, "OS", "White", 1],
  [11571, "102446", "Dynamic™", "N95 Flatfold Disposable Respirator - 20 Pack", "270-RPD723N95", "/archive/pim/300/6/RPD723N95.jpg", 139, 0, "OS", "White", 1],
  [11571, "102450", "Dynamic™", "P95 Disposable Respirator with Valve - 10 Pack", "270-RPD614P95", "/archive/pim/300/33/RPD614P95.jpg", 136, 0, "OS", "White", 1],
  [11571, "174487", "North® SAF‑T‑FIT®", "Nuisance Dust Mask - 50 Pack", "14110094CC", "/archive/pim/300/42/PIP_14110094cc.jpg", 140, 0, "OS", "White", 1],
]);

/** ccID 11818 — 4 products. */
export const escapeSolutions: BrandProduct[] = build([
  [11818, "174681", "North®", "Emergency Escape Mouthbit Respirator complete for Acid Gas for 7900 Series", "7902", "/archive/pim/300/42/PIP_7902.jpg", 141, 0, "OS", "Black", 1],
  [11818, "175094", "North®", "Polystyrene Woven Nylon Polyethene Escape Hood", "ER2000CBRN", "/archive/pim/300/42/PIP_ER2000CBRN.jpg", 142, 0, "OS", "Gray", 1],
  [11818, "174682", "North®", "Silicone Ammonia/Methyamine Mouthbit Respirator for 7900 Series", "7904", "/archive/pim/300/42/PIP_7904.jpg", 143, 0, "OS", "Black", 1],
  [11818, "174683", "North®", "Nylon Carrying Bag for Mouthbit Respirator Cartridges", "79BAG", "/archive/pim/300/42/PIP_79Bag_Small.jpg", 144, 0, "OS", "Black", 1],
]);

/** ccID 11668 — 54 products. */
export const reusableFacepieces: BrandProduct[] = build([
  [11668, "174644", "North® Defender™", "Multi-Contaminent P100 Respirator Cartridge", "75SCP100L", "/archive/pim/300/42/PIP_75SCP100L.jpg", 145, 0, "OS", "Black", 1],
  [11668, "144752", "JSP® Force Typhoon™8", "Half-Mask Respirator - Medium", "272-RPRF8820", "/archive/pim/300/11/272-RPRF8820---NC.jpg", 146, 0, "M", "Gray", 1],
  [11668, "144754", "JSP®", "P100 Particulate Filter", "272-RPRF4004", "/archive/pim/300/32/272-RPFR4004_b.jpg", 147, 0, "OS", "Magenta", 1],
  [11668, "174663", "North® 7700 Series", "Half Mask, Silicone with Dual N-Series Cartridge Connectors", "770030", "/archive/pim/300/42/PIP_cq5dam.web.1280.1280_1.jpg", 148, 0, "S, M, L", "Black", 1],
  [11668, "174633", "North®", "P100 Filters (2/pk)", "7580P100", "/archive/pim/300/42/PIP_7580p100.jpg", 149, 0, "OS", "Pink", 1],
  [11668, "174645", "North® 7600 Series", "Full Facepiece, Medical-Grade Silicone with 5-Strap Headband & Dual N-Series Connectors", "760008A", "/archive/pim/300/48/North_7600.jpg", 150, 0, "S, M/L", "Black", 1],
  [11668, "148419", "JSP®", "Organic Vapor Cartridge", "272-RPRF51V0", "/archive/pim/300/15/F-51V0.jpg", 151, 0, "OS", "White", 1],
  [11668, "174584", "North® 5500 Series", "Half Mask, Elastomeric with Dual N-Series Cartridge Connectors", "550030", "/archive/pim/300/42/PIP_5500-Halfmask-w_cart1.jpg", 152, 0, "S, M, L", "Black", 1],
  [11668, "144753", "JSP® Force Typhoon™8", "Half-Mask Respirator - Large", "272-RPRF8830", "/archive/pim/300/11/272-RPRF8830---NC.jpg", 146, 0, "L", "Gray", 1],
  [11668, "144823", "JSP®", "Respirator Fit Test Kit", "272-BPT050", "/archive/pim/300/36/BPT050-000-000-MAIN.jpg", 153, 0, "KIT", "Yellow", 1],
  [11668, "174570", "North® 5400 Series", "Elastomeric Full Facepiece with 4-Strap Headband & Dual N-Series Connectors", "5400", "/archive/pim/300/42/PIP_54001.jpg", 154, 0, "S, M/L", "Black", 1],
  [11668, "175124", "North®", "Organic Vapor (OV) Respirator Cartridge", "N75001L", "/archive/pim/300/43/PIP_n75001l.jpg", 155, 0, "OS", "Black", 1],
  [11668, "174637", "North®", "Organic Vapor and Acid Gas (OV/AG) with P100 Respirator Cartridge", "7583P100L", "/archive/pim/300/42/PIP_7583p100l.jpg", 156, 0, "OS", "Pink", 1],
  [11668, "175248", "North® RU6500 Series", "Silicone Full Facepiece with 5-Point Head Harness", "RU65001", "/archive/pim/300/43/PIP_RU6500.jpg", 157, 0, "S, M, L", "Black", 1],
  [11668, "144751", "JSP® Force Typhoon™8", "Half-Mask Respirator - Small", "272-RPRF8810", "/archive/pim/300/10/272-RPRF8810---NC.jpg", 146, 0, "S", "Gray", 1],
  [11668, "174634", "North®", "Organic Vapor (OV) with P100 Respirator Cartridge", "7581P100L", "/archive/pim/300/42/PIP_7581p100l.jpg", 158, 0, "OS", "Pink", 1],
  [11668, "150986", "JSP®", "P100 Pancake Filter with OV", "272-RPRF1104", "/archive/pim/300/32/NIOSH_FORCE_COMPACT_GREY_PO5_001.jpg", 159, 0, "OS", "Gray", 1],
  [11668, "144827", "JSP®", "Portacount/AccuFIT Quantitative Fit Test Adaptor", "272-BPT092", "/archive/pim/300/36/BPT092-000-000-MAIN.jpg", 160, 0, "KIT", "Yellow", 1],
  [11668, "167765", "JSP®", "N95 Pre-Filter", "272-RPRF5005", "/archive/pim/300/38/272-RPRF5005.jpg", 161, 0, "OS", "White", 1],
  [11668, "174572", "North® 5400 Series", "Full Facepiece Welding Attachment, Elastomeric with 4-Strap Headband & Dual N-Series Connectors", "5400W", "/archive/pim/300/42/PIP_54001w.jpg", 162, 0, "S, M/L", "Black", 1],
  [11668, "174648", "North® 7600 Series", "7600 Series Full Facepiece with Welding Attachment, Medical-Grade Silicone, 5-Strap, Dual N-Series Connectors", "760008AW", "/archive/pim/300/41/PIP_760008AW.jpg", 163, 0, "S, M/L", "Black", 1],
  [11668, "163968", "JSP®", "Reusable N95 Pre-Filter Retainer", "272-RPRF0501", "/archive/pim/300/40/FORCE_F-5005_FilterHolder_PO5.jpg", 164, 0, "OS", "Clear", 1],
  [11668, "156946", "JSP®", "P100 Pancake Filter", "272-RPRF1004", "/archive/pim/300/35/NIOSH_FORCE_COMPACT_WHITE_PO5_001.jpg", 165, 0, "OS", "White", 1],
  [11668, "144790", "JSP® Force Typhoon™8", "Force Typhoon™ 8 Size Guide", "272-SIZEGUIDE", "/archive/pim/300/10/272-Sizeguide.jpg", 166, 0, "OS", "Black", 1],
  [11668, "174642", "North®", "Flexible, Low Profile P100 Filter with Odor Relief", "75FFP100NL", "/archive/pim/300/45/PIP_75ffp100nl.jpg", 167, 0, "OS", "Pink", 1],
  [11668, "174643", "North® Defender™", "Multi-Gas Vapor Cartridge", "75SCL", "/archive/pim/300/42/PIP_75SCL.jpg", 168, 0, "OS", "Black", 1],
  [11668, "175132", "North®", "Organic Vapor and Acid Gas (OV/AG) Respirator Cartridge", "N75003L", "/archive/pim/300/43/PIP_n75003l.jpg", 169, 0, "OS", "Black", 1],
  [11668, "174639", "North®", "Mercury Vapor Chlorine with ESLI and with P100 Respirator Cartridge", "75852P100L", "/archive/pim/300/42/PIP_75852p100l.jpg", 170, 0, "OS", "Pink", 1],
  [11668, "174641", "North®", "Flexible, Low Proﬁle P100 Filter (2/pk)", "75FFP100", "/archive/pim/300/45/PIP_75ffp100.jpg", 171, 0, "OS", "Pink", 1],
  [11668, "175273", "North® RU8500 Series", "Blue Half Mask with Speech Diaphragm and Industrial Exhalation Cover", "RU85001", "/archive/pim/300/43/PIP_RU85001.jpg", 172, 0, "S, M, L", "Blue", 1],
  [11668, "175250", "North® RU6500 Series", "Silicone Full Facepiece with Mesh Headnet", "RU65002", "/archive/pim/300/42/PIP_41bfd2527c47b86b8c18dba3a43c8c3420af143c.jpg", 157, 0, "S, M, L", "Black", 1],
  [11668, "175282", "North® RU8800 Series", "Triple Flange Silicone Half Mask", "RU88001", "/archive/pim/300/43/PIP_ru88001s.jpg", 173, 0, "S, M/L", "Black", 1],
  [11668, "154789", "JSP®", "JSP® Storage Bucket for Reusable Facepieces", "272-BUCKET", "/archive/pim/300/34/272-BUCKET---S-2.jpg", 174, 0, "OS", "White", 1],
  [11668, "175133", "North®", "Ammonia Methylamine Respirator Cartridge", "N75004L", "/archive/pim/300/43/PIP_n75004l.jpg", 175, 0, "OS", "White", 1],
  [11668, "102457", "Dynamic™", "Replacement Hood for Bitrex Fit Test Kit", "270-RPHOOD", "/archive/pim/300/9/270-RPHOOD.jpg", 176, 0, "OS", "Yellow", 1],
  [11668, "174623", "North®", "N95 Pad Filters (12/pk)", "7506N95", "/archive/pim/300/42/PIP_7506n95.jpg", 177, 0, "OS", "White", 1],
  [11668, "175134", "North®", "Mercury Vapor Chlorine with ESLI Respirator Cartridge", "N750052L", "/archive/pim/300/43/PIP_n750052l.jpg", 178, 0, "OS", "White", 1],
  [11668, "174626", "North®", "R95 Pad Filter", "7506R95", "/archive/pim/300/42/PIP_7506r95.jpg", 179, 0, "OS", "White", 1],
  [11668, "174635", "North®", "Acid Gas (AG) with P100 Respirator Cartridge", "7582P100L", "/archive/pim/300/42/PIP_7582p100l.jpg", 180, 0, "OS", "Purple", 1],
  [11668, "174650", "North®", "Metal Spring Spectacle Kit (No Lenses) - Compatible with 5400 Series Full Facepieces", "760024", "/archive/pim/300/42/PIP_760024.jpg", 181, 0, "OS", "Black", 1],
  [11668, "175126", "North®", "Acid Gas Respirator Cartridge", "N75002L", "/archive/pim/300/43/PIP_n75002l.jpg", 169, 0, "OS", "White", 1],
  [11668, "174696", "North®", "Peel-Away Clear Cover Lens for 5400 Series Full Facepieces", "80836A", "/archive/pim/300/42/PIP_80836a.jpg", 182, 0, "OS", "Clear", 1],
  [11668, "174624", "North®", "N99 Pad Filters (10/pk)", "7506N99", "/archive/pim/300/42/PIP_7506n99.jpg", 179, 0, "OS", "Black", 1],
  [11668, "174762", "North®", "Flame-Resistant Welding Shroud", "8419H", "/archive/pim/300/43/PIP_north-8419-respiratory-shroud-npid47540.jpg", 183, 0, "OS", "Black", 1],
  [11668, "174652", "North®", "Nylon Carrying Bag for Full Facepiece Respirators & Cartridges", "76BAG", "/archive/pim/300/45/PIP_76BAG.jpg", 184, 0, "OS", "Blue", 1],
  [11668, "174702", "North®", "7600 Series Full Facepiece Replacement Lens", "80849-H5", "/archive/pim/300/45/PIP_80849-H5.jpg", 185, 0, "OS", "Clear", 1],
  [11668, "174678", "North®", "Nylon Carrying Bag for Half Mask Respirator Cartridges", "77BAG", "/archive/pim/300/42/PIP_77BAG.jpg", 186, 0, "OS", "Black", 1],
  [11668, "174640", "North®", "Nitrogen Dioxide P100 Filter Cartridge", "7586P100L", "/archive/pim/300/51/7586P100L-Pair.jpg", 187, 0, "OS", "White", 1],
  [11668, "174638", "North®", "Ammonia/Methylamine with P100 Respirator Cartridge", "7584P100L", "/archive/pim/300/42/PIP_7584p100l.jpg", 188, 0, "OS", "White", 1],
  [11668, "175128", "North®", "Pre-Filter Retainers - 2 Pairs", "N750036", "/archive/pim/300/43/PIP_n750036.jpg", 189, 0, "OS", "Clear", 1],
  [11668, "174666", "North® Irritant Smoke Fit Test Tubes For Any Respirator", "Irritant Smoke Fit Test Tubes For Any Respirator", "770046", "/archive/pim/300/42/PIP_770046.jpg", 190, 0, "OS", "Black", 1],
  [11668, "175127", "North®", "Particulate Filter Adapter", "N750035", "/archive/pim/300/43/PIP_n750035.jpg", 191, 0, "OS", "Black", 1],
  [11668, "174636", "North®", "Organic Vapor Acid Gas P100 Respirator Cartridge", "7583P100BL", "/images/img-coming-soon.png", 192, 0, "OS", "White", 1],
  [11668, "175125", "North®", "Protective Shower Cap for 7580P100 Filter", "N750029", "/archive/pim/300/43/PIP_n750029.jpg", 193, 0, "OS", "Black", 1],
]);

/** ccID 11819 — 8 products. */
export const suppliedAirRespirators: BrandProduct[] = build([
  [11819, "175152", "North®", "Primair 100 Supplied Air Hood Assembly With Coated Bibbed Hood", "PA121", "/archive/pim/300/45/PIP_PA121.jpg", 194, 0, "OS", "Gray", 1],
  [11819, "175148", "North®", "Primair 100 Supplied Air Hood Assembly With Bibbed Hood", "PA111", "/archive/pim/300/45/PIP_PA111.jpg", 195, 0, "OS", "Gray", 1],
  [11819, "175075", "North®", "Nylon CF2000 Series Constant Flow Supplied Air Assembly", "CF2007", "/archive/pim/300/42/PIP_b9308166f0dfea2775fbe931f412931634791a94.jpg", 196, 0, "OS", "Black", 1],
  [11819, "174765", "North®", "Supplied Air Pump (3/4 HP) - 2 Person", "86610", "/archive/pim/300/42/PIP_86610.jpg", 197, 0, "OS", "Black", 1],
  [11819, "175066", "North®", "CF1000 CF-SAR Respiratory Assembly", "CF1001D", "/archive/pim/300/45/PIP_CF1001D.jpg", 198, 0, "OS", "White", 1],
  [11819, "174517", "North®", "Cotton/Twill Free Hood", "14530001", "/archive/pim/300/43/PIP_resp-free-air-hood-14530005-npid40649.jpg", 199, 0, "OS", "White", 1],
  [11819, "175043", "North®", "50' X 3/8\" ID Black Breathing Air Hose", "996050", "/archive/pim/300/43/PIP_resp-996050-npid40429.jpg", 200, 0, "OS", "Black", 1],
  [11819, "175146", "North®", "Peel-Away Windows for Primair 100 Series - 5-Pack", "PA105", "/archive/pim/300/42/PIP_fxlnqbytn7p5zgodjfqb.jpg", 201, 0, "OS", "Clear", 1],
]);

/** Every product of this category, keyed by PIP ccID. */
export const pipRespiratoryProtection: Record<string, BrandProduct[]> = {
  '11571': disposableMasks,
  '11818': escapeSolutions,
  '11668': reusableFacepieces,
  '11819': suppliedAirRespirators,
};
