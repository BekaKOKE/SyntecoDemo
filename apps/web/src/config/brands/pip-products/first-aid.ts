import type { BrandProduct } from '../types';
import { buildProducts, type ProductRow, type ProductTables } from './build';

/**
 * PIP First Aid products — Fendall(R) and Eyesaline(R) eyewash stations,
 * cartridges and accessories plus first aid kits, mirrored from
 * https://us.pipglobal.com/en/products/?scID=2570
 *
 * Names and catalog numbers stay in English: buyers search by PIP
 * nomenclature. Only the descriptions are localised.
 *
 * Generated — do not edit by hand.
 */

const SC_ID = 2570;

const TABLES: ProductTables = {
  /** Russian card copy, shared between products of the same family. */
  descriptions: {
    12: "Станция для промывки глаз Pure Flow 1000®: безопасность, надёжность и цена вне конкуренции. Патентованная система подаёт стерильный физиологически корректный солевой раствор из заводских картриджей и не требует дорогой подводки воды — станцию можно поставить рядом с любым источником опасности.",
    13: "Сменный картридж с солевым раствором для станции Pure Flow 1000®: ничего не нужно смешивать и отмерять, исключено попадание частиц и микроорганизмов из воздуха. Картридж запечатан до момента использования, срок годности 24 месяца от даты изготовления указан на активационной ленте. В комплекте два картриджа.",
    14: "Стерильный раствор для промывки глаз, всегда под рукой. Яркая заметная упаковка для экстренного промывания и деконтаминации: при травме глаза счёт идёт на секунды, и здесь выручают персональные флаконы.",
    15: "Прочная одностенная станция на два флакона по 32 унции со стерильным раствором для немедленного промывания. Хорошо заметна в опасной зоне и всегда готова к экстренной промывке и деконтаминации глаз. Не заменяет основное оборудование, но важно его дополняет.",
    16: "Шесть минут непрерывной промывки без участия рук — немедленное удаление загрязнений из глаз. Мобильна, дорогая подводка воды не нужна. Простота установки и работы сделала её популярным выбором. В комплекте концентрат, который смешивается с водой; соответствует ANSI Z358.1.",
    17: "Станция Fendall® 2000™ с солевым раствором: всё, что ожидаешь от современной переносной станции экстренной промывки глаз. Эргономичная конструкция помогает выдержать требование ANSI о 15 минутах промывки. Глаза обрабатываются буферным раствором с выверенным pH — быстро, точно и удобно.",
    18: "Сменный картридж обеспечивает 15 минут одновременной промывки обоих глаз в едином автономном блоке. Легко заменяет использованный или просроченный картридж станции Fendall® 2000™.",
    19: "Концентрат Eyesaline® разводится чистой питьевой водой в пропорции 10:1 и даёт консервированный буферный физиологически корректный раствор. Перед заправкой станцию нужно очистить от загрязнений на стенках. Концентрат обеспечивает стабильный расход и высоту струи на всё время промывки — для Porta Stream® I и II и других систем.",
    20: "Essential™ Eye Wash — стерильная мелкодисперсная взвесь на чистой воде культурального качества с корректным pH. Помогает удалять частицы и раздражающие химикаты с кожи и из глаз. Технология «пакет в баллоне» повышает гигиеничность, исключает химические пропелленты и продлевает срок службы, защищая воду от жары и холода.",
    21: "При травме глаза счёт идёт на секунды — здесь и выручают персональные флаконы. Они не заменяют основное оборудование, но важно его дополняют: флакон можно разместить гораздо ближе к источнику опасности и начать промывку до того, как пострадавший дойдёт до стационарной станции.",
    22: "Прочная одностенная станция на два флакона по 16 унций со стерильным раствором для немедленного промывания. Хорошо заметна в опасной зоне и всегда готова к экстренной промывке и деконтаминации глаз. Не заменяет основное оборудование, но важно его дополняет.",
    23: "Термочехол Fendall® Pure Flow 1000® из прочного долговечного винила удерживает раствор в станции тёплым в холодных цехах, чтобы она была готова к работе в любой момент. Нагреватель внутри чехла рассчитан на температуру до −40 °F и соответствует стандарту ANSI для основных систем промывки глаз.",
    24: "Прочная одностенная станция на один флакон 32 унции со стерильным раствором для немедленного промывания. Хорошо заметна в опасной зоне и всегда готова к экстренной промывке и деконтаминации глаз. Не заменяет основное оборудование, но важно его дополняет.",
    25: "Прочная одностенная станция на один флакон 16 унций со стерильным раствором для немедленного промывания. Хорошо заметна в опасной зоне и всегда готова к экстренной промывке и деконтаминации глаз. Не заменяет основное оборудование, но важно его дополняет.",
    26: "Универсальная тележка на колёсах под станции Pure Flow 1000®, Fendall® 2000™ или Porta Stream® II. Делает любую автономную станцию промывки глаз мобильной — её можно подкатить к нужному участку.",
    27: "Универсальная стойка под станции Pure Flow 1000®, Fendall® 2000™ или Porta Stream® II. Позволяет разместить автономную станцию промывки глаз на любом участке — удобная альтернатива настенному монтажу.",
    28: "Первая обработка травмы глаза решает исход, поэтому такая сумка нужна спасателям, медикам, полиции, военным, на стройках и в аварийных бригадах. Прочная компактная сумка вмещает 12 персональных флаконов со стерильным раствором — удобно для промывки на месте и в дороге.",
    29: "Пылезащитный чехол специально для Pure Flow 1000®: держит станцию чистой, без мусора и загрязнений, чтобы в нужный момент раствор шёл правильным потоком и факелом.",
    30: "Пылезащитный чехол для станций Porta Stream® I и II — защита от внешних загрязнений.",
    31: "Подходит к любой станции бакового типа после активации: удобно собирать отработанную промывочную жидкость. Блок мобильный, с формованной ручкой для переноски.",
    32: "Сменная пломба для Pure Flow 1000®: помогает при визуальном осмотре убедиться, что станция не была активирована.",
    33: "Сменный вытяжной ремешок для быстрой активации станции без участия рук. Продаётся отдельно, возвращает надёжную работу, когда штатный ремешок износился, повреждён или загрязнён.",
    34: "Сменный узел форсунки для станций промывки глаз: обеспечивает правильный поток и факел распыла. Продаётся отдельно для замены изношенных или загрязнённых форсунок — поддерживает работоспособность станции по требованиям ANSI Z358.1.",
    35: "Используется прямо из запечатанного картриджа — ничего смешивать и отмерять не нужно. Eyesaline® — консервированный буферный раствор с выверенным pH: срок хранения до 24 месяцев закрытым и 6 месяцев после вскрытия. При активации Fendall® Flash Flood® подаёт галлон раствора за три минуты.",
    36: "Низкопрофильная крышка специально для станции Fendall® 2000™: держит станцию чистой, без мусора и загрязнений, чтобы в нужный момент раствор шёл правильным потоком и факелом.",
    37: "Защищает станции промывки глаз в холоде и на улице: не даёт раствору замёрзнуть и держит блок готовым к немедленному использованию. Поддерживает рабочие условия и помогает соблюдать требования готовности по ANSI Z358.1.",
    38: "Сменная запирающая крышка для Porta Stream® II: не пропускает мусор и пыль к готовому раствору. Чистота раствора критична — он попадает прямо в глаз пострадавшему.",
    39: "Прочные двустенные станции под два флакона по 16 или по 32 унции со стерильным раствором для немедленного промывания. Хорошо заметны в опасной зоне и всегда готовы к экстренной промывке и деконтаминации глаз. Не заменяют основное оборудование, но важно его дополняют.",
    40: "Шесть минут непрерывной промывки без участия рук — немедленное удаление загрязнений из глаз. Мобильна, дорогая подводка воды не нужна. Простота установки и эксплуатации позволяет ставить автономный блок рядом с большинством источников опасности.",
    41: "Сменный настенный кронштейн для монтажа систем Porta Stream® I и II — позволяет разместить станцию рядом с основными источниками опасности на объекте.",
    42: "Готовый раствор для систем бакового типа: заливается в станцию прямо из канистры, разводить не нужно. Основной станции по ANSI требуется 16 галлонов раствора — это ровно 16 таких канистр.",
    43: "Система Fendall® Flash Flood®: немедленная промывка глаз без участия рук, переносная — под меняющиеся риски на площадке. Активируется снятием вытяжного ремешка, две форсунки промывают оба глаза одновременно. Подаёт галлон раствора за три минуты.",
    44: "Стойка для хранения Flash Flood® вмещает до 4 сменных картриджей. Ставится там, где стоят станции Flash Flood®, чтобы замена была под рукой.",
    45: "Система Fendall® Flash Flood®: немедленная промывка глаз без участия рук, переносная. Активируется снятием вытяжного ремешка, две форсунки промывают оба глаза одновременно, галлон раствора за три минуты. Версия с франко-канадской маркировкой.",
    46: "Используется прямо из запечатанного картриджа — ничего смешивать и отмерять не нужно. Eyesaline® — консервированный буферный раствор с выверенным pH: до 24 месяцев закрытым и 6 месяцев после вскрытия. Подаёт галлон раствора за три минуты. Версия с франко-канадской маркировкой.",
    47: "Набор для очистки станций промывки глаз перед заправкой — удаляет загрязнения со стенок бака.",
    48: "Прочный металлический настенный кронштейн для станции промывки глаз Pure Flow 1000®.",
    49: "Наклейки для Pure Flow 1000® с общей инструкцией на французском языке.",
    50: "Монтажный кронштейн для станции Fendall® 2000™: позволяет разместить станцию рядом с опасными веществами, способными попасть в глаза.",
    51: "Чехол специально для Porta Stream® II: отражает солнечный свет на открытых площадках и держит раствор тёплым.",
    52: "Станция промывки глаз Pure Flow 1000®: безопасность, надёжность и цена вне конкуренции. Патентованная система подаёт стерильный физиологически корректный раствор из заводских картриджей и не требует подводки воды. Версия с маркировкой на французском.",
    53: "Держатель позволяет повесить флакон Eyesaline® любого объёма в любом месте, куда крепится магнит.",
    54: "Набор для защиты от теплового стресса: помогает уберечь бригаду от последствий высоких температур. Для работы на улице, в жарких цехах и там, где нужно следить за состоянием людей в тяжёлых условиях.",
    55: "Компактные аптечки с необходимым для обработки лёгких травм. Точный состав каждой аптечки — в техпаспорте.",
    56: "Аптечки класса A укомплектованы под самые частые производственные травмы.",
    57: "Аптечки класса B содержат более широкий и качественный набор средств для сложных условий и повышенных рисков — например, ожоговые повязки, шины и жгуты.",
  },
  /** Russian application tags. */
  applications: {
    0: [],
  },
};

const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);

/** ccID 11687 — 47 products. */
export const eyewash: BrandProduct[] = build([
  [11687, "169666", "Fendall® Pure Flow 1000®", "Emergency Eyewash Station - Station Only", "32-001000-0000", "/archive/pim/300/42/PIP_32-001000-0000.jpg", 12, 0, "OS", "Green", 1],
  [11687, "169671", "Fendall® Pure Flow 1000®", "Replacement Cartridges, Buffered Saline Solution - Set of Two Boxes", "32-001050-0000-H5", "/archive/pim/300/44/PIP_32-001050-0000-H5.jpg", 13, 0, "OS", "White", 1],
  [11687, "169646", "Eyesaline®", "32 oz Bottle Sterile Eyewash Solution", "32-000455-0000-H5", "/archive/pim/300/41/PIP_32-000455-0000-H5.jpg", 14, 0, "32 oz", "White", 1],
  [11687, "169653", "Eyesaline®", "32 oz Double Bottle Eyewash Wall Station - Bottles Not Included", "32-000462-0000-H5", "/archive/pim/300/42/PIP_eyesaline_wall_stations_ewash_wall_station_32-000465.jpg", 15, 0, "OS", "Green", 1],
  [11687, "169629", "Fendall® Porta Stream® II", "Portable Eyewash Station 16 Gallon Capacity, Eyesaline® Concentrate Included", "32-000200-0000", "/archive/pim/300/41/PIP_32-000200-0000.jpg", 16, 0, "OS", "Green", 1],
  [11687, "178879", "Fendall® 2000™", "Emergency Eyewash Station", "32-002000-0000", "/archive/pim/300/45/PIP_32-002000-0000_1.jpg", 17, 0, "OS", "Green", 1],
  [11687, "169645", "Eyesaline®", "16 oz Bottle Sterile Eyewash Solution", "32-000454-0000-H5", "/archive/pim/300/41/PIP_32-000454-0000-H5.jpg", 14, 0, "16 oz", "White", 1],
  [11687, "178880", "Fendall® 2000™", "Replacement Cartridge - Fendall® 2000™", "32-002450-0000", "/archive/pim/300/43/PIP_32-002450-0000.jpg", 18, 0, "OS", "Green", 1],
  [11687, "169661", "Fendall® Porta Stream®", "Replacement Saline Concentrate, 170 oz for Porta Stream® I & II Units", "32-000513-0000-H5", "/archive/pim/300/42/PIP_d51bde6a66c3f954fb33805b4a03122e3a01018c.jpg", 19, 0, "OS", "White", 1],
  [11687, "156789", "PIP® Essential Eye Wash®", "Essential™ Eye Wash 7oz Push-Button Canister", "299-FAEW-70009", "/archive/pim/300/36/299-FAEW-70009-Cap On.jpg", 20, 0, "7 oz", "White", 1],
  [11687, "169642", "Eyesaline®", "1 oz Bottle Sterile Eyewash Solution - Travel Bag Refill Size", "32-000451-0000", "/archive/pim/300/41/PIP_32-000451-0000.jpg", 21, 0, "1 oz", "White", 1],
  [11687, "169643", "Eyesaline®", "4 oz Bottle Sterile Eyewash Solution", "32-000452-0000", "/archive/pim/300/41/PIP_32-000452-0000.jpg", 14, 0, "4 oz", "White", 1],
  [11687, "169655", "Eyesaline®", "16 oz Double Bottle Eyewash Wall Station - Bottles Not Included", "32-000465-0000", "/archive/pim/300/41/PIP_32-000465-0000.jpg", 22, 0, "OS", "Green", 1],
  [11687, "175981", "Fendall® Pure Flow 1000®", "Heating Jacket Accessory - Pure Flow 1000® Emergency Eyewash Station", "32-001001-0000", "/archive/pim/300/43/PIP_32-001001-0000.jpg", 23, 0, "OS", "Yellow", 1],
  [11687, "169650", "Eyesaline®", "32 oz Single Bottle Eyewash Wall Station - Bottle Not Included", "32-000461-0000", "/archive/pim/300/42/PIP_32-000461-0000.jpg", 24, 0, "OS", "Green", 1],
  [11687, "169647", "Eyesaline®", "16 oz Single Bottle Eyewash Wall Station - Bottle Not Included", "32-000460-0000-H5", "/archive/pim/300/41/PIP_32-000460-0000-H5.jpg", 25, 0, "OS", "Green", 1],
  [11687, "156767", "PIP® Essential Eye Wash®", "Essential™ Eye Wash 7oz Trigger-Style Canister, Twin Packed", "299-FAEW-70207", "/archive/pim/300/16/299-FAEW-70207-Standard.jpg", 20, 0, "7 oz", "White", 1],
  [11687, "169640", "Eyesaline®", "8 oz Bottle Sterile Eyewash Solution", "32-000445-0000", "/archive/pim/300/41/PIP_32-000445-0000.jpg", 21, 0, "OS", "White", 1],
  [11687, "169673", "Fendall®", "Universal Eyewash Cart", "32-001060-0000", "/archive/pim/300/42/PIP_32-001060-0000.jpg", 26, 0, "OS", "Black", 1],
  [11687, "169674", "Fendall®", "Universal Eyewash Stand", "32-001065-0000", "/archive/pim/300/42/PIP_32-001065-0000.jpg", 27, 0, "OS", "Black", 1],
  [11687, "169639", "Eyesaline®", "Personal Emergency Eyewash Travel Bag Six 1 oz Bottles and Six 4 oz Bottles of Eyewash", "32-000440-0000", "/archive/pim/300/41/PIP_32-000440-0000.jpg", 28, 0, "OS", "Black", 1],
  [11687, "169668", "Fendall® Pure Flow 1000®", "Low Profile Dust Cover", "32-001015-0000", "/archive/pim/300/45/PIP_32-001015-0000.jpg", 29, 0, "OS", "Yellow", 1],
  [11687, "169663", "Fendall® Porta Stream®", "Dust Cover for Porta Stream® I & II Units", "32-000522-0000", "/archive/pim/300/42/PIP_32-000522-0000.jpg", 30, 0, "OS", "Green", 1],
  [11687, "169660", "Fendall® Porta Stream®", "Eyewash Waste Container for Porta Stream® I & II Units", "32-000511-0000", "/archive/pim/300/42/PIP_32-000511-0000.jpg", 31, 0, "OS", "Gray", 1],
  [11687, "169669", "Fendall® Pure Flow 1000®", "Replacement Tamper Seal", "32-001017-0000", "/archive/pim/300/45/PIP_32-001017-0000.jpg", 32, 0, "OS", "White", 1],
  [11687, "169627", "Fendall® Porta Stream®", "Replacement Pull Strap for Porta Stream® I & II Units", "32-000102-0000", "/archive/pim/300/41/PIP_32-000102-0000.jpg", 33, 0, "OS", "Green", 1],
  [11687, "169631", "Fendall® Porta Stream® II", "Replacement Nozzle Assembly for Porta Stream® II Units", "32-000203-0000", "/archive/pim/300/41/PIP_32-000203-0000.jpg", 34, 0, "OS", "Green", 1],
  [11687, "169635", "Fendall® Flash Flood®", "Replacement Cartridge Refill - One-Gallon", "32-000401-0000", "/archive/pim/300/41/PIP_32-000401-0000.jpg", 35, 0, "OS", "Green", 1],
  [11687, "169677", "Fendall® 2000™", "Dust Cover", "32-002015-0000", "/archive/pim/300/42/PIP_d98ca267d26c81d36f41764deaf408e4914abe7a.jpg", 36, 0, "OS", "Green", 1],
  [11687, "169676", "Fendall® 2000™", "Heated Accessory", "32-002001-0000", "/archive/pim/300/42/PIP_ad2f73027496096dcfcd93d5ec026f4095d58040.jpg", 37, 0, "OS", "Green", 1],
  [11687, "169630", "Fendall® Porta Stream® II", "Replacement Locking Fill Cap for Porta Stream® II Units", "32-000201-0000", "/archive/pim/300/41/PIP_32-000201-0000.jpg", 38, 0, "OS", "Green", 1],
  [11687, "169657", "Eyesaline®", "Double Bottle Eyewash Wall Station - Bottles Not Included", "32-000490-0000", "/images/img-coming-soon.png", 39, 0, "OS", "Green", 1],
  [11687, "169626", "Fendall® Porta Stream® I", "Portable Eyewash Station 6 Gallon Capacity - Eyesaline® Concentrate Included", "32-000100-0000", "/archive/pim/300/41/PIP_32-000100-0000.jpg", 40, 0, "OS", "Green", 1],
  [11687, "169628", "Fendall® Porta Stream®", "Replacement Wall Bracket for Porta Stream® I & II Units", "32-000105-0000", "/archive/pim/300/41/PIP_32-000105-0000.jpg", 41, 0, "OS", "Green", 1],
  [11687, "169658", "Eyesaline®", "1 Gallon Pre-Mixed Saline Solution - Ready to Use", "32-000502-0000", "/archive/pim/300/42/PIP_32-000502-0000.jpg", 42, 0, "OS", "Yellow", 1],
  [11687, "169633", "Fendall® Flash Flood®", "Portable Eyewash Station with 1 Gallon Saline Solution", "32-000400-0000", "/archive/pim/300/41/PIP_32-000400-0000.jpg", 43, 0, "OS", "Green", 1],
  [11687, "169659", "Fendall® Porta Stream®", "Replacement Saline Concentrate for Porta Stream® I & II Units - 70 oz", "32-000509-0000-H5", "/archive/pim/300/42/PIP_koiuwksqyaoap4vzwbru.jpg", 19, 0, "OS", "White", 1],
  [11687, "169637", "Fendall® Flash Flood®", "Cartridge Storage Rack - 4 Cartridge Capacity", "32-000402-0000", "/archive/pim/300/41/PIP_32-000402-0000.jpg", 44, 0, "OS", "White", 1],
  [11687, "169634", "Fendall® Flash Flood®", "Portable Eyewash Station with 1 Gallon Saline Solution - French Canadian Labels", "32-000400-0022", "/archive/pim/300/43/PIP_se55oiq75s2vsafyv09s.jpg", 45, 0, "OS", "Green", 1],
  [11687, "169636", "Fendall® Flash Flood®", "Replacement Cartridge Refill - One-Gallon - French Canadian Labels", "32-000401-0022", "/archive/pim/300/43/PIP_lulnmvnz17odfnrywe3c.jpg", 46, 0, "OS", "Green", 1],
  [11687, "169662", "Fendall®", "Eyewash Station Cleaning Kit", "32-000518-0000", "/archive/pim/300/42/PIP_32-000518-0000.jpg", 47, 0, "OS", "Green", 1],
  [11687, "169672", "Fendall® Pure Flow 1000®", "Eyewash Station Wall Bracket", "32-001051-0000", "/archive/pim/300/42/PIP_32-001051-0000.jpg", 48, 0, "OS", "Green", 1],
  [11687, "169670", "Fendall® Pure Flow 1000®", "Unit Labels - French Canadian", "32-001018-0022", "/images/img-coming-soon.png", 49, 0, "OS", "White", 1],
  [11687, "169678", "Fendall® 2000™", "Mounting Bracket", "32-002051-0000", "/archive/pim/300/42/PIP_fcad9d65ce5ddcdd2ecba7f1c592510a02e6d30a.jpg", 50, 0, "OS", "White", 1],
  [11687, "169665", "Fendall® Porta Stream® II", "Reflective Jacket for Porta Stream® II Units", "32-000532-0000", "/archive/pim/300/42/PIP_32-000532-0000.jpg", 51, 0, "OS", "Green", 1],
  [11687, "169667", "Fendall® Pure Flow 1000®", "Emergency Eyewash Station - Station Only - French Canadian Labels", "32-001000-0022", "/archive/pim/300/42/PIP_fendall_pure_flow_1000_ewash_pureflow1000_2010.jpg", 52, 0, "OS", "Green", 1],
  [11687, "169638", "Fendall®", "Emergency Eyewash Universal Bottle Mount - Up To 32 oz Bottles", "32-000435-0000-H5", "/archive/pim/300/42/PIP_ad968a52e29ce88c20446b97bf04e397addf9b15.jpg", 53, 0, "OS", "Green", 1],
]);

/** ccID 11582 — 27 products. */
export const firstAidKit: BrandProduct[] = build([
  [11582, "153390", "PIP®", "Heat Stress Kit", "299-HEATKIT", "/archive/pim/300/33/299-HEATKIT---F.jpg", 54, 0, "OS", "White", 1],
  [11582, "40693", "PIP®", "Contractor First Aid Kit - 10 Person", "299-13285", "/archive/pim/300/33/299-13285---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143081", "PIP®", "ANSI Class A First Aid Kit - 25 Person", "299-21025A-M", "/archive/pim/300/11/299-21025A-M---Front.jpg", 56, 0, "KIT", "White", 1],
  [11582, "40695", "PIP®", "Contractor First Aid Kit - 50 Person", "299-13293", "/archive/pim/300/33/13293---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "40694", "PIP®", "Contractor First Aid Kit - 25 Person", "299-13290", "/archive/pim/300/33/299-13290---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "63306", "PIP®", "First Aid and Bloodborne Pathogens Kit", "299-17030", "/archive/pim/300/3/299-17030---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "40690", "PIP®", "Bloodborne Pathogens Kit", "299-13215", "/archive/pim/300/33/299-13215---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "40697", "PIP®", "Personal First Aid Kit - 25 Person", "299-13225", "/archive/pim/300/33/13225---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143084", "PIP®", "ANSI Class A Aid Kit - 50 Person", "299-21050A-M", "/archive/pim/300/11/299-21050A-M---Front.jpg", 56, 0, "KIT", "White", 1],
  [11582, "40696", "PIP®", "Personal First Aid Kit - 10 Person", "299-13210", "/archive/pim/300/33/299-13210---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143169", "PIP®", "ANSI Class B Metal First Aid Kit - 50 Person", "299-21050B-M", "/archive/pim/300/10/299-21050B-M---Front.jpg", 57, 0, "KIT", "White", 1],
  [11582, "148357", "PIP®", "Contractor First Aid Kit - 25 Person", "299-AK25C", "/archive/pim/300/32/299-AK25C---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "148356", "PIP®", "Contractor First Aid Kit - 10 Person", "299-AK10C", "/archive/pim/300/15/299-AK10C---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143323", "PIP®", "ANSI Class B First Aid Refill Pouches - 50 Person", "299-21050B-RP", "/archive/pim/300/10/299-21050B-RP---Full Set.jpg", 57, 0, "KIT", "Clear", 1],
  [11582, "143083", "PIP®", "ANSI Class A Waterproof First Aid Kit - 50 Person", "299-21050A", "/archive/pim/300/11/299-21050A---Front.jpg", 56, 0, "KIT", "White", 1],
  [11582, "148359", "PIP®", "Burn Kit", "299-BRN", "/archive/pim/300/15/299-BRN---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143028", "PIP®", "ANSI Class A Waterproof First Aid Kit - 25 Person", "299-21025A", "/archive/pim/300/10/299-21025A---Front.jpg", 56, 0, "KIT", "White", 1],
  [11582, "148239", "PIP®", "Bloodborne Pathogens Kit", "299-BBP", "/archive/pim/300/15/299-BBP---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "148390", "PIP®", "Personal First Aid Kit - 25 Person", "299-AK25H", "/archive/pim/300/32/299-AK25H---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "148358", "PIP®", "Contractor First Aid Kit - 50 Person", "299-AK50C", "/archive/pim/300/15/299-AK50C---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "40698", "PIP®", "Personal First Aid Kit - 50 Person", "299-13255", "/archive/pim/300/33/299-13255---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "40691", "PIP®", "Burn Kit", "299-13295", "/archive/pim/300/3/299-13295.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143085", "PIP®", "ANSI Class A Waterproof First Aid Kit - 50 Person", "299-21050A-RP", "/archive/pim/300/11/299-21050A-RP.jpg", 56, 0, "KIT", "White", 1],
  [11582, "148199", "PIP®", "OSHA Basic Personal First Aid Kit - 10 Person", "299-AK10H", "/archive/pim/300/15/299-AK10H---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "148360", "PIP®", "First Aid and Bloodborne Pathogens Kit", "299-FABBP", "/archive/pim/300/15/299-FABBP---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "148355", "PIP®", "Personal First Aid Kit - 50 Person", "299-AK50H", "/archive/pim/300/15/299-AK50H---F.jpg", 55, 0, "KIT", "White", 1],
  [11582, "143082", "PIP®", "ANSI Class A Waterproof First Aid Kit - 25 Person - Refill Pack", "299-21025A-RP", "/images/img-coming-soon.png", 56, 0, "KIT", "White", 1],
]);

/** Every product of this category, keyed by PIP ccID. */
export const pipFirstAid: Record<string, BrandProduct[]> = {
  '11687': eyewash,
  '11582': firstAidKit,
};
