import type { BrandProduct } from '../types';
import { buildProducts, type ProductRow, type ProductTables } from './build';

/**
 * PIP Heat Stress products — EZ-Cool(R), HyperKewl(TM) and THORZT(TM)
 * cooling, hydration and sun protection, mirrored from
 * https://us.pipglobal.com/en/products/?scID=2574
 *
 * Names and catalog numbers stay in English: buyers search by PIP
 * nomenclature. Only the descriptions are localised.
 *
 * Generated — do not edit by hand.
 */

const SC_ID = 2574;

const TABLES: ProductTables = {
  /** Russian card copy, shared between products of the same family. */
  descriptions: {
    54: "Набор для защиты от теплового стресса: помогает уберечь бригаду от последствий высоких температур. Для работы на улице, в жарких цехах и там, где нужно следить за состоянием людей в тяжёлых условиях.",
    80: "Крепится к оголовью каски на кнопки. Мягкая махровая ткань впитывает пот со лба. В упаковке 20 налобников.",
    81: "Высокотехнологичная бесшовная эластичная ткань отводит влагу и быстро сохнет. Защищает от ветра, солнца и пыли.",
    82: "Высокотехнологичная бесшовная эластичная ткань отводит влагу. Врождённая огнестойкость, материал соответствует NFPA 2112.",
    83: "Мягкая впитывающая целлюлоза из гидрофильных волокон в виде волокнистого холста. Целлюлозе нужна активация водой.",
    84: "Испарительный охлаждающий налобник.",
    85: "Мягкий впитывающий полипористый материал из гидрофильных волокон в виде волокнистого холста. Активация водой не требуется.",
    86: "Быстро снижает температуру при намокании и активации. Активируется взмахом или встряхиванием в воздухе. Даёт УФ-защиту и не задерживает запахи.",
    87: "Для жарких условий — защита от теплового стресса. После смачивания небольшим количеством воды ткань ощущается прохладнее окружающего воздуха и держит холод часами. Полотенце можно разрезать и обернуть вокруг головы, шеи или запястий либо носить под вентилируемой кепкой. Высохло — добавьте воды, отожмите, и оно снова работает.",
    88: "Для тёплых условий в помещении и на улице — защита от теплового стресса. Эффект усиливается, если носить нарукавники на точках пульса: на запястье или под мышкой.",
    89: "EcoChill — линия сигнальной одежды из экологичных материалов: сотрудники остаются заметными и не перегреваются. Круглогодичный вариант: зимой рубашка работает первым слоем и отводит пот, летом держит человека сухим и прохладным.",
    90: "Смесовая ткань полиэстер/хлопок с охлаждающими кристаллами. Крепится в каске на липучку. Эффективно охлаждает над оголовьем.",
    91: "Для строительства, дорожных работ, железной дороги и грузоперевозок, логистики, служб общественной безопасности — везде, где нужна сигнальная одежда.",
    92: "Для жарких условий — защита от теплового стресса. После смачивания небольшим количеством воды ткань ощущается прохладнее окружающего воздуха и держит холод часами. Высохло — добавьте воды, отожмите, и оно снова работает.",
    93: "Смесовая ткань полиэстер/хлопок с охлаждающими кристаллами в верхней части. Надёжно крепится в каске. Охлаждает и одновременно закрывает шею от солнца.",
    94: "Испарительный материал HyperKewl™ впитывает воду и медленно отдаёт её при испарении — по сути, усиливает естественное охлаждение тела и защищает от теплового стресса. В отличие от решений, которые работают до и после нагрузки, HyperKewl™ охлаждает прямо во время работы.",
    95: "Смесовая ткань полиэстер/хлопок с охлаждающими кристаллами. Завязывается на голове или шее. Активируется замачиванием в воде.",
    96: "Для тёплых условий в помещении и на улице — защита от теплового стресса.",
    97: "Лёгкая двухслойная влагоотводящая ткань держит человека сухим, прохладным и в комфорте. Внутренний слой отводит влагу от кожи на внешний, где она испаряется. Не задерживает запахи и стойка к ультрафиолету.",
    98: "Для тёплых условий в помещении и на улице — защита от теплового стресса. Строительство, автопром, горнодобыча, сельское хозяйство, медицина, аварийные службы, общепит, нефтедобыча, промплощадки, спортивные мероприятия.",
    99: "Материал на поливиниловом спирте (PVA) эффективно впитывает воду и пот и работает часами. Естественное испарение даёт ощущение прохлады в тёплой среде. Прополощите полотенце EZ-COOL® перед использованием и оберните вокруг шеи или головы либо протрите точки пульса.",
    100: "Для строительства, автопрома, горнодобычи, сельского хозяйства, медицины и аварийных служб, общепита, нефтедобычи, промплощадок и спортивных мероприятий. Не предназначено для работ с риском электрической дуги или вспышки пламени.",
    101: "Испарительный материал KewlFabric™ впитывает воду и медленно отдаёт её при испарении — усиливает естественное охлаждение тела и защищает от теплового стресса. В отличие от решений, которые работают до и после нагрузки, KewlFabric™ охлаждает прямо во время работы.",
    102: "Смесовая ткань полиэстер/хлопок с охлаждающими полимерами в верхней части. Удлинённая накидка закрывает шею от солнца. Охлаждение держится от 1 до 7 дней в зависимости от условий.",
    103: "Для строительства, автопрома, горнодобычи, сельского хозяйства, медицины и аварийных служб, общепита, нефтедобычи, промплощадок и спортивных мероприятий.",
    104: "Для жарких условий — защита от теплового стресса. После смачивания небольшим количеством воды ткань ощущается прохладнее воздуха и держит холод часами. Высохло — добавьте воды и отожмите. Повязку активируют взмахом или встряхиванием в воздухе.",
    105: "Испарительный охладитель для верха каски. Крепится на липучке к оголовью каски, защитного шлема или лёгкой каски. От 5 до 10 часов активного охлаждения на одну активацию.",
    106: "Испарительный материал KewlFabric™ впитывает воду и медленно отдаёт её при испарении — усиливает естественное охлаждение тела и защищает от теплового стресса. Работает прямо во время нагрузки: достаточно замочить в воде.",
    107: "THORZT™ — научно проверенная смесь современных электролитов для быстрой гидратации прямо на объекте. Freeze Shots мягко восстанавливают водный баланс, сразу дают охлаждение и повышают выносливость в жару. Упаковка «сломай и открути» — можно брать с собой куда угодно.",
    108: "THORZT™ — не просто гидратация: научно проверенная смесь витаминов, минералов и аминокислот для быстрого восстановления водного баланса и мышц. Solo Shots разработаны под здоровье и безопасность людей физического труда: профилактика и облегчение при тепловом стрессе, меньше связанных с жарой недомоганий и травм.",
    109: "Комплект из 4 охлаждающих вкладышей. Материал PCM негорючий и нетоксичный. Для активации положите в морозильник, холодильник или сумку-холодильник с температурой около 14 °C.",
    110: "Защита от теплового стресса в помещении и на улице. Для строительства, сварки, горнодобычи, металлообработки, нефтедобычи и промплощадок.",
    111: "Защита от теплового стресса в помещении и на улице. Для строительства, горнодобычи, металлообработки, нефтедобычи и промплощадок.",
    112: "Персональный охлаждающий жилет держит комфортные 18 °C до 3 часов. Полутвёрдый материал-накопитель (PCM) поглощает тепло, которое выделяет человек. Хорошее решение для высокой влажности и для ношения под другими СИЗ, где испарительные изделия работают плохо. Температура подобрана так, чтобы не вызывать сужение сосудов.",
    113: "Бюджетный вариант на материале PCM по новейшей технологии Solid-Solid Gel. Не требует тканевого носителя или жилета. Держит до 4 часов на одну зарядку при 25 °C в среде 35 °C и 60% влажности.",
    114: "Несколько часов охлаждения без громоздкой свободной посадки обычных охлаждающих жилетов — защита от теплового стресса в помещении и на улице. Для строительства, сварки, горнодобычи, металлообработки, нефтедобычи и промплощадок.",
    115: "Комплект из 2 охлаждающих пакетов. Материал PCM негорючий. Для активации положите в морозильник или замочите в ледяной воде на час до полного затвердевания.",
    116: "Сменные охлаждающие пакеты дают несколько часов охлаждения, снижая усталость и тепловой стресс. Для жилета 390-EZHYPC EZ-Cool® Max с комбинированным PCM- и испарительным охлаждением.",
    117: "Быстросъёмный поликарбонатный солнцезащитный козырёк только для шлема Traverse™. Дымчатый: сохраняет обзор вверх и притеняет глаза.",
    118: "Сигнальная солнцезащитная накидка Traverse Hi-Vis 360 со светоотражающим кантом.",
    119: "Удлинённый козырёк спереди закрывает глаза от солнца, накидка сзади притеняет шею. Резинка сзади обеспечивает надёжную посадку.",
    120: "Насадка на каску для защиты от солнечных лучей.",
    121: "Удлинённый козырёк спереди закрывает глаза от солнца, накидка притеняет шею. Эластичная лента держит посадку.",
    122: "Накидка сзади притеняет шею, резинка обеспечивает надёжную посадку. Сигнальная ткань с серебристой светоотражающей лентой.",
    123: "Лёгкая, с сетчатой тульей — вентиляция и прохлада. Широкие поля закрывают лицо и шею от солнца. Шнурок фиксирует шляпу на голове.",
    124: "100% полиэстер с сетчатой тульей: лёгкость и вентиляция. Широкие поля закрывают лицо и шею от солнца. Шнурок фиксирует шляпу на голове.",
    125: "Дополнительная заметность там, где соответствие ANSI не требуется: сбор тележек на парковке, выгул собак, парковщики, бегуны, водители доставки, работники зон отдыха.",
    126: "Плетёная полиэфирная сетка — лёгкость и воздухопроницаемость. Эластичное кольцо садится на поля каски и держит накидку на месте. Закрывает заднюю часть шеи от солнца.",
    127: "Для строительства, коммунальных служб, судоверфей — везде, где нужна сигнальная одежда.",
  },
  /** Russian application tags. */
  applications: {
    0: [],
  },
};

const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);

/** ccID 11655 — 6 products. */
export const absorptive: BrandProduct[] = build([
  [11655, "36827", "PIP® EZ-Cool®", "Terry Cloth Sweatband for Hard Hats", "396-20870", "/archive/pim/300/4/396-20870-BGE---I-inside-transparent-helmet.jpg", 80, 0, "OS", "Beige, Navy", 1],
  [11655, "87382", "PIP® Clima-Band™", "Absorptive Head & Neck Cover", "393-200", "/archive/pim/300/4/393-200-CBL---MFR-over-nose.jpg", 81, 0, "OS", "Cowboy Blue, Hi-Vis Yellow", 1],
  [11655, "110267", "PIP® Clima-Band™", "FR Clima-Band, 50/50 Meta-Aramid & Lenzing FR, Inherent FR, Black", "395-250FR", "/archive/pim/300/7/395-250FR-B.jpg", 82, 0, "OS", "Black", 1],
  [11655, "21191", "PIP® EZ-Cool®", "Cellulose Sponge Sweatband", "396-500", "/archive/pim/300/4/396-500---MHFR.jpg", 83, 0, "OS", "Blue", 1],
  [11655, "157179", "PIP® EZ-Cool® Max", "Evaporative Cooling Brow Pad", "396-510", "/archive/pim/300/38/396-510-Front.jpg", 84, 0, "OS", "Blue", 1],
  [11655, "22939", "PIP® EZ-Cool®", "Polyporous Fiber Sweatband", "396-505", "/archive/products/300/396-505.jpg", 85, 0, "OS", "Teal", 1],
]);

/** ccID 11616 — 27 products. */
export const evaporativeCooling: BrandProduct[] = build([
  [11616, "83981", "PIP® EZ-Cool® Max", "Evaporative Cooling Towel", "396-EZ900", "/archive/pim/300/4/396-EZ900-NV.jpg", 86, 0, "OS", "Camouflage, Navy, Neon Pink, Neon Yellow", 1],
  [11616, "48181", "PIP® EZ-Cool®", "EZ-Cool Evaporative PVA Cooling Towel", "396-602", "/archive/pim/300/6/396-602-B---IU-Towel-Behind-Neck-Looking-Down-EDITED.jpg", 87, 0, "OS", "Blue, Neon Pink, Neon Yellow", 1],
  [11616, "104634", "PIP® EZ-Cool® Max", "Evaporative Cooling Sleeve", "391-EZ275", "/archive/pim/300/7/391-EZ275LY.jpg", 88, 0, "M-L, XL-2XL", "Black, Hi-Vis Yellow, White", 1],
  [11616, "160564", "Reflective Apparel™ EcoChill", "ANSI Type R Class 3 Short Sleeve T-Shirt with Coolmax® Technology", "104CMPS", "/archive/pim/300/16/104 CMPS LM_Front.jpg", 89, 0, "XS, S, M, L, LT, XL, XLT, 2XL, 2XLT, 3XL, 3XLT, 4XL, 4XLT, 5XL, 5XLT, 6XL, 6XLT", "Hi-Vis Orange, Hi-Vis Yellow", 1],
  [11616, "27563", "PIP® EZ-Cool®", "Evaporative Hard Hat Cooling Pad", "396-400", "/archive/pim/300/4/396-400---F-inside-transparent-helmet.jpg", 90, 0, "OS", "Blue", 1],
  [11616, "160782", "Reflective Apparel™ EcoChill", "ANSI Type R Class 3 Long Sleeve T-Shirt with COOLMAX® Technology", "204CMPS", "/archive/pim/300/16/204 CMPS LM_Front.jpg", 91, 0, "XS, S, ST, M, MT, L, LT, XL, XLT, 2XL, 2XLT, 3XL, 3XLT, 4XL, 4XLT, 5XL, 5XLT, 6XL", "Hi-Vis Orange, Hi-Vis Yellow", 1],
  [11616, "83610", "PIP® EZ-Cool®", "Evaporative Cooling Neck Wrap", "393-650", "/archive/pim/300/4/393-650---OMH.jpg", 92, 0, "OS", "Blue, Neon Pink, Neon Yellow", 1],
  [11616, "21187", "PIP® EZ-Cool®", "Evaporative Cooling Hard Hat Pad with Neck Shade", "396-405", "/archive/pim/300/4/396-405---MHFR.jpg", 93, 0, "OS", "Blue", 1],
  [11616, "104760", "PIP® EZ-Cool® Max", "Evaporative Cooling Towel - Bulk Pack", "396-EZ900-BULK", "/archive/pim/300/8/396-EZ900-NV-LY--PACKAGE.jpg", 86, 0, "OS", "Navy, Neon Yellow", 1],
  [11616, "26973", "PIP® EZ-Cool®", "ANSI Type R Class 2 Evaporative Cooling Vest", "390-EZ202", "/archive/pim/300/4/390-EZ202-YL---MF-black-shirt.jpg", 94, 0, "S-M, L-XL, 2XL-3XL, 4XL-5XL", "Hi-Vis Yellow", 1],
  [11616, "26494", "PIP® EZ-Cool®", "Evaporative Cooling Bandana", "393-100", "/archive/pim/300/36/393-100-Cowboy Red.jpg", 95, 0, "OS", "Blue, Camouflage, Cowboy Blue, Cowboy Red, Navy, Patriot, Tan", 1],
  [11616, "147187", "PIP® EZ-Cool® Max", "360° Evaporative Cooling Headband", "393-EZ500", "/archive/pim/300/11/393-EZ500-BL---FR.jpg", 96, 0, "OS", "Black, Blue, Hi-Vis Yellow, Pink", 1],
  [11616, "128211", "PIP® Clima-Band™", "Adjustable 2-Layer Neck Gaiter", "393-EZ310", "/archive/pim/300/8/393-EZ310-YEL---OMH FRONT.jpg", 97, 0, "OS", "Black, Hi-Vis Yellow", 1],
  [11616, "81440", "PIP® EZ-Cool®", "Evaporative Cooling Vest", "390-EZ100", "/archive/pim/300/4/390-EZ100---MF.jpg", 94, 0, "S, M, L, XL, 2XL, 3XL", "Hi-Vis Yellow", 1],
  [11616, "27564", "PIP® EZ-Cool®", "Evaporative Cooling Tie Hat", "396-300", "/archive/pim/300/4/396-300-CBL---MHFR.jpg", 98, 0, "OS", "Cowboy Blue, Navy, Patriot", 1],
  [11616, "91258", "PIP® EZ-Cool®", "EZ-Cool Evap. PVA Cooling Towel 13in. x 31in. Blue BULK PACKED", "396-602-BULK", "/archive/pim/300/6/396-602-B---IU-Towel-Behind-Neck-Looking-Down-EDITED.jpg", 99, 0, "OS", "Blue", 1],
  [11616, "64652", "PIP® EZ-Cool®", "FR Plus Evaporative Cooling Neck Shade", "396-EZFR811", "/archive/pim/300/4/396-EZ811FR---MHB.jpg", 100, 0, "OS", "Navy", 1],
  [11616, "157126", "PIP® EZ-Cool®", "Evaporative Cooling Vest Contoured with Zipper", "390-EZ101", "/archive/pim/300/35/390-EZ101---F.jpg", 101, 0, "S, M, L, XL, 2XL, 3XL", "Hi-Vis Yellow", 1],
  [11616, "26540", "PIP® EZ-Cool®", "Evaporative Cooling Ranger Hat", "396-425", "/archive/pim/300/4/396-425-KHK---MHFR.jpg", 102, 0, "M, L, XL", "Tan", 1],
  [11616, "83778", "PIP® EZ-Cool®", "Evaporative Cooling Ranger Hat", "396-EZ450", "/archive/pim/300/4/396-EZ450-LY.jpg", 94, 0, "S-M, L-XL, 2XL-3XL", "Hi-Vis Yellow, Tan", 1],
  [11616, "64654", "PIP® EZ-Cool®", "Plus Evaporative Hi-Vis Cooling Neck Shade", "396-EZ810", "/archive/pim/300/4/396-EZ810---MHB.jpg", 103, 0, "OS", "Hi-Vis Yellow", 1],
  [11616, "83765", "PIP® EZ-Cool®", "Evaporative Tank Top", "390-EZ150", "/archive/pim/300/4/390-EZ150---MF.jpg", 94, 0, "S, M, L, XL, 2XL, 3XL", "Black", 1],
  [11616, "147246", "PIP® EZ-Cool® Max", "Evaporative Cooling Tieback Headband - PVA with Wicking Fiber", "393-EZ400", "/archive/pim/300/11/393-EZ400-LY---MHFR.jpg", 104, 0, "OS", "Hi-Vis Yellow", 1],
  [11616, "26970", "PIP® EZ-Cool®", "Evaporative Mesh Cooling Bandana", "393-EZ201", "/archive/pim/300/4/393-EZ201-NVY---OMN.jpg", 96, 0, "OS", "Navy", 1],
  [11616, "157180", "PIP® EZ-Cool® Max", "Evaporative Cooling Crown Cooler", "396-402", "/archive/pim/300/38/396-402-Front.jpg", 105, 0, "OS", "Blue", 1],
  [11616, "157181", "PIP® EZ-Cool® Max", "Evaporative Cooling Neckshade", "396-EZ812", "/archive/pim/300/38/396-EZ812-Front.jpg", 103, 0, "OS", "Hi-Vis Yellow", 1],
  [11616, "157136", "PIP® EZ-Cool®", "Evaporative Cooling Vest with Tieback", "390-EZ102", "/archive/pim/300/35/390-EZ102---F.jpg", 106, 0, "M-L, L-XL", "Hi-Vis Yellow", 1],
]);

/** ccID 11736 — 5 products. */
export const hydration: BrandProduct[] = build([
  [11736, "148352", "THORZT™", "Electrolyte Freeze Shots - Mixed Flavor Pack", "ICEMIX", "/archive/pim/300/33/ICEMIX---F.jpg", 107, 0, "OS", "Multi", 1],
  [11736, "153390", "PIP®", "Heat Stress Kit", "299-HEATKIT", "/archive/pim/300/33/299-HEATKIT---F.jpg", 54, 0, "OS", "White", 1],
  [11736, "153576", "THORZT™", "Sugar Free Solo Shots - Cherry Punch", "SSSFCP", "/archive/pim/300/16/SSSFCP---Bag.jpg", 108, 0, "OS", "Cherry Punch", 1],
  [11736, "153577", "THORZT™", "Sugar Free Solo Shots - Peach Mango", "SSSFPM", "/archive/pim/300/16/SSSFPM---Bag.jpg", 108, 0, "OS", "Peach Mango", 1],
  [11736, "148353", "THORZT™", "Sugar Free Electrolyte Freeze Shots - Mixed Flavor Pack", "ICEMIX-SF", "/archive/pim/300/33/ICEMIX-2---F.jpg", 107, 0, "OS", "Multi", 1],
]);

/** ccID 11627 — 8 products. */
export const phaseChangeCooling: BrandProduct[] = build([
  [11627, "64657", "EZ-Cool®", "Replacement Cooling Packs - 4-Pack", "390-PC099", "/archive/pim/300/4/390-PC099.jpg", 109, 0, "OS", "Clear", 1],
  [11627, "157332", "PIP® EZ-Cool® Max", "Premium FR Phase Change Active Fit Cooling Vest with Insulated Cooler Bag", "390-EZPC-FR", "/archive/pim/300/35/390-EZPC-FR---Front Angle.jpg", 110, 0, "M-L, L-XL, 2XL-3XL", "Navy", 1],
  [11627, "64649", "PIP® EZ-Cool®", "Premium Phase Change Active Fit Cooling Vest with Insulated Cooler Bag", "390-EZSPC", "/archive/pim/300/4/390-EZSPC---OMF.jpg", 111, 0, "M-L, L-XL, 2XL-3XL", "Blue", 1],
  [11627, "29336", "PIP® EZ-Cool®", "Phase Change Cooling System with Cooling Packs", "390-PCVKT1", "/archive/pim/300/4/390-PCVST1---MF.jpg", 112, 0, "OS", "Navy", 1],
  [11627, "160280", "PIP® EZ-Cool®", "Phase Change Cooling Vest 3D Cube Style", "390-EZPC3D", "/archive/pim/300/41/390-EZPC3D-Front.jpg", 113, 0, "OS", "Blue", 1],
  [11627, "105547", "PIP® EZ-Cool® Max", "EZ-Cool Max Combination Phase Change & Evaporative Cooling Vest", "390-EZHYPC", "/archive/pim/300/7/390-EZHYPC---OMF.jpg", 114, 0, "M, L, XL, 2XL, 3XL", "Red", 1],
  [11627, "29171", "EZ-Cool®", "Replacement Phase Change Cooling Packs - 2 Pack", "390-PCVCP1", "/archive/pim/300/4/390-PCVCP1---cooling-pack.jpg", 115, 0, "OS", "Clear", 1],
  [11627, "105508", "EZ-Cool® Max", "Replacement Phase Change Cooling Packs - 4 Pack", "390-HY099", "/archive/pim/300/7/390-HY099---Replacement Packs.jpg", 116, 0, "OS", "Clear", 1],
]);

/** ccID 11656 — 15 products. */
export const sunProtection: BrandProduct[] = build([
  [11656, "143304", "PIP® Traverse™", "Shaded Polycarbonate Front Sun Brim for Traverse™", "280-HP1491SUN", "/archive/pim/300/11/280-HP1491SUN---Close.jpg", 117, 0, "OS", "Smoke", 1],
  [11656, "145597", "PIP® Traverse™", "Traverse Hi-Vis 360 Sunshade with Reflective Piping", "280-HP1491FSUN", "/archive/pim/300/10/280-HP1491FSUN.jpg", 118, 0, "OS", "Hi-Vis Yellow", 1],
  [11656, "91158", "PIP® EZ-Cool®", "Hi-Vis Full Brim Hard Hat Visor with Neck Shade", "396-850", "/archive/pim/300/4/396-850---FR.jpg", 119, 0, "OS", "Hi-Vis Orange, Hi-Vis Yellow", 1],
  [11656, "48140", "PIP® EZ-Cool®", "FR Treated Hi-Vis Hard Hat Visor and Neck Shade", "396-801FR", "/archive/pim/300/4/396-801FR---MHFL.jpg", 103, 0, "OS", "Hi-Vis Yellow", 1],
  [11656, "61157", "JSP®", "Sun Shade Extensions for Full Brim Hard Hats", "281-SSE-FB", "/archive/pim/300/3/281-SSE-FB---MFR.jpg", 120, 0, "OS", "Green", 1],
  [11656, "103400", "PIP® EZ-Cool®", "FR Treated Hi-Vis Full Brim Hard Hat Visor with Neck Shade", "396-851FR", "/archive/pim/300/10/396-851FR-LY---FR.jpg", 121, 0, "OS", "Hi-Vis Orange, Hi-Vis Yellow", 1],
  [11656, "68482", "PIP®", "FR Treated Hi-Vis Hard Hat Neck Shade", "396-700FR", "/archive/pim/300/4/396-700FR-YEL---MFR.jpg", 122, 0, "OS", "Hi-Vis Orange, Hi-Vis Yellow", 1],
  [11656, "28358", "PIP® EZ-Cool®", "Hi-Vis Hard Hat Visor and Neck Shade", "396-800", "/archive/pim/300/4/396-800---MHFR.jpg", 119, 0, "OS", "Hi-Vis Yellow", 1],
  [11656, "60512", "PIP®", "Sun Shade Extensions for Cap Style Hard Hats", "281-SSE-CAP", "/archive/pim/300/3/281-SSE-CAP---MFR.jpg", 120, 0, "OS", "Green", 1],
  [11656, "19131", "PIP®", "Ranger Hat", "350-RANGER", "/archive/pim/300/4/350-Ranger---MHFR.jpg", 123, 0, "OS", "Hi-Vis Yellow", 1],
  [11656, "151986", "PIP®", "Ranger Hat With Neck Shade", "350-RANGER-NS", "/archive/pim/300/14/350-RANGER-NS---FR.jpg", 124, 0, "OS", "Hi-Vis Yellow", 1],
  [11656, "162177", "Reflective Apparel™", "Baseball Hat with Adjustable Sweatband", "803ST", "/archive/pim/300/38/803-ST-LM_3Quarter_Left_1200x1200.jpg", 125, 0, "OS", "Hi-Vis Orange, Hi-Vis Yellow, Black and Hi-Vis Yellow", 1],
  [11656, "162185", "Reflective Apparel™", "Full Brim Hard Hat Visor with Neck Shade", "809ST", "/archive/pim/300/38/809-ST-LM_Side_Left_1200x1200.jpg", 126, 0, "OS", "Hi-Vis Yellow", 1],
  [11656, "162180", "Reflective Apparel™", "Ranger Hat", "804ST", "/archive/pim/300/38/804-ST-LM_Front_1200x1200.jpg", 127, 0, "OS", "Hi-Vis Orange, Hi-Vis Yellow", 1],
  [11656, "162186", "Reflective Apparel™", "Baseball Hat with Adjustable Sweatband", "813ST", "/archive/pim/300/38/813-ST-LB_3Quarter_Left_1200x1200.jpg", 125, 0, "OS", "Black and Hi-Vis Yellow", 1],
]);

/** Every product of this category, keyed by PIP ccID. */
export const pipHeatStress: Record<string, BrandProduct[]> = {
  '11655': absorptive,
  '11616': evaporativeCooling,
  '11736': hydration,
  '11627': phaseChangeCooling,
  '11656': sunProtection,
};
