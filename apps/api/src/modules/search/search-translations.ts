/**
 * Russian → English industrial term dictionary.
 * When a user searches in Russian, known terms are translated to English
 * so the search can match English product titles from Grainger data.
 *
 * For unknown Russian words, we also do a Latin-script pass-through
 * (the word stays as-is for ILIKE matching on brand names, SKUs, etc.).
 */

type TranslationMap = Record<string, string[]>;

const TRANSLATIONS: TranslationMap = {
  // ── Safety / PPE ──
  'респиратор': ['respirator'],
  'респираторы': ['respirator'],
  'маска': ['mask'],
  'маски': ['mask'],
  'перчатки': ['gloves'],
  'перчатка': ['glove'],
  'нитриловые': ['nitrile'],
  'нитриловый': ['nitrile'],
  'каска': ['helmet', 'hard hat', 'head protection'],
  'каски': ['helmet', 'hard hat'],
  'очки': ['goggles', 'glasses', 'safety glasses', 'eye protection'],
  'защита': ['protection', 'protective', 'safety', 'guard'],
  'сапоги': ['boots', 'boot'],
  'ботинки': ['boots', 'shoe', 'footwear'],
  'комбинезон': ['coverall', 'overall', 'suit'],
  'спецодежда': ['workwear', 'clothing', 'coverall', 'uniform'],
  'жилет': ['vest'],
  'пояс': ['belt', 'harness'],

  // ── Tools ──
  'инструмент': ['tool', 'tools'],
  'инструменты': ['tools', 'tool'],
  'дрель': ['drill', 'drilling'],
  'шуруповерт': ['driver', 'screwdriver', 'screwdriver drill', 'impact driver'],
  'перфоратор': ['rotary hammer', 'hammer drill', 'sds', 'rotary'],
  'болгарка': ['angle grinder', 'grinder', 'disc grinder'],
  'шлифовальный': ['grinding', 'sanding', 'abrasive', 'grinder'],
  'шлифовка': ['grinding', 'sanding', 'abrasive'],
  'пила': ['saw', 'blade'],
  'нож': ['knife', 'cutter', 'blade'],
  'ножницы': ['scissors', 'shear', 'cutter'],
  'молоток': ['hammer'],
  'отвертка': ['screwdriver'],
  'ключ': ['wrench', 'key', 'spanner'],
  'гаечный': ['wrench', 'spanner', 'socket'],
  'плоскогубцы': ['plier', 'pliers'],
  'тиски': ['vise', 'clamp'],
  'зажим': ['clamp', 'clip', 'holder', 'grip'],
  'струбцина': ['clamp'],

  // ── Electrical ──
  'электрика': ['electrical', 'electric'],
  'кабель': ['cable', 'wire'],
  'кабели': ['cable', 'wire'],
  'провод': ['wire', 'cable', 'cord'],
  'провода': ['wires', 'cable', 'cord'],
  'розетка': ['outlet', 'receptacle', 'socket'],
  'выключатель': ['switch', 'breaker'],
  'светильник': ['light', 'lamp', 'luminaire', 'lighting'],
  'лампа': ['lamp', 'light', 'bulb'],
  'лампочка': ['bulb', 'lamp', 'light'],
  'трансформатор': ['transformer'],
  'автомат': ['breaker', 'circuit breaker', 'disconnect'],
  'щит': ['panel', 'panelboard', 'enclosure', 'box'],
  'щиток': ['panel', 'box', 'enclosure'],
  'удлинитель': ['extension cord', 'cord'],

  // ── Pneumatics ──
  'пневматика': ['pneumatic', 'air'],
  'пневмоцилиндр': ['pneumatic cylinder', 'air cylinder', 'cylinder'],
  'цилиндр': ['cylinder'],
  'компрессор': ['compressor', 'air compressor'],
  'шланг': ['hose', 'tube', 'tubing'],
  'фитинг': ['fitting', 'connector'],
  'клапан': ['valve'],
  'регулятор': ['regulator', 'controller'],

  // ── Hydraulics ──
  'гидравлика': ['hydraulic', 'hydraulics'],
  'насос': ['pump'],
  'гидроцилиндр': ['hydraulic cylinder', 'cylinder'],
  'масло': ['oil', 'fluid', 'lubricant'],

  // ── Fasteners / Hardware ──
  'крепеж': ['fastener', 'fasteners', 'hardware'],
  'болт': ['bolt'],
  'болты': ['bolts', 'bolt'],
  'гайка': ['nut'],
  'гайки': ['nuts', 'nut'],
  'шайба': ['washer'],
  'винт': ['screw'],
  'винты': ['screws', 'screw'],
  'саморез': ['self tapping', 'screw', 'tek screw'],
  'дюбель': ['anchor', 'dowel', 'wall plug'],
  'анкер': ['anchor'],
  'заклепка': ['rivet'],
  'шпилька': ['stud', 'rod'],

  // ── Bearings / PT ──
  'подшипник': ['bearing'],
  'подшипники': ['bearing', 'bearings'],
  'ремень': ['belt'],
  'шкив': ['pulley', 'sheave'],
  'цепь': ['chain'],
  'звездочка': ['sprocket'],
  'вал': ['shaft', 'axle'],
  'муфта': ['coupling', 'connector'],

  // ── Motors ──
  'двигатель': ['motor', 'engine'],
  'двигатели': ['motor', 'motors', 'engine'],
  'электродвигатель': ['electric motor', 'motor'],
  'мотор': ['motor'],
  'привод': ['drive', 'actuator'],
  'редуктор': ['gearbox', 'reducer', 'gear'],

  // ── Welding ──
  'сварка': ['weld', 'welding'],
  'сварочный': ['welding', 'weld'],
  'электрод': ['electrode', 'rod'],
  'электроды': ['electrode', 'electrodes', 'rod'],
  'горелка': ['torch', 'burner'],

  // ── Plumbing/HVAC ──
  'сантехника': ['plumbing', 'plumb'],
  'труба': ['pipe', 'tube', 'tubing'],
  'трубы': ['pipe', 'pipes', 'tube', 'tubing'],
  'трубка': ['tube', 'tubing', 'pipe'],
  'фильтр': ['filter', 'filtration', 'strainer'],
  'вентиляция': ['ventilation', 'hvac', 'fan', 'vent'],
  'отопление': ['heating', 'heater', 'hvac'],
  'радиатор': ['radiator', 'heater'],
  'котел': ['boiler'],
  'водонагреватель': ['water heater', 'heater', 'boiler'],
  'смеситель': ['faucet', 'mixer', 'valve'],

  // ── Cleaning ──
  'уборка': ['cleaning', 'janitorial', 'clean'],
  'чистящий': ['cleaning', 'cleaner', 'detergent'],
  'моющее': ['detergent', 'cleaner', 'cleaning'],
  'тряпка': ['cloth', 'rag', 'wipe'],
  'салфетка': ['wipe', 'cloth', 'towel'],
  'швабра': ['mop'],
  'ведро': ['bucket', 'pail'],
  'пылесос': ['vacuum', 'vacuum cleaner'],

  // ── Packaging ──
  'упаковка': ['packaging', 'package', 'packing', 'box'],
  'коробка': ['box', 'carton', 'container'],
  'пакет': ['bag', 'pack', 'package'],
  'скотч': ['tape', 'adhesive tape'],
  'пленка': ['film', 'wrap', 'plastic'],
  'стрейч': ['stretch', 'stretch wrap', 'film'],

  // ── Lab ──
  'лаборатория': ['lab', 'laboratory'],
  'колба': ['flask', 'beaker'],
  'пробирка': ['tube', 'test tube', 'vial'],
  'пипетка': ['pipette', 'pipet'],
  'микроскоп': ['microscope'],

  // ── Fleet / Vehicle ──
  'автопарк': ['fleet', 'vehicle', 'automotive'],
  'шина': ['tire', 'tyre'],
  'аккумулятор': ['battery'],
  'масляный': ['oil', 'lubricant'],
  'тормоз': ['brake'],
  'фильтр масляный': ['oil filter'],

  // ── Materials ──
  'нержавеющий': ['stainless', 'stainless steel'],
  'нержавейка': ['stainless', 'stainless steel'],
  'сталь': ['steel'],
  'алюминий': ['aluminum', 'aluminium'],
  'медь': ['copper'],
  'латунь': ['brass'],
  'пластик': ['plastic', 'polymer'],
  'резина': ['rubber'],
  'силикон': ['silicone'],
  'стекло': ['glass'],
  'дерево': ['wood'],

  // ── General ──
  'промышленный': ['industrial'],
  'профессиональный': ['professional', 'pro'],
  'тяжелый': ['heavy duty', 'heavy'],
  'большой': ['large', 'big'],
  'маленький': ['small', 'mini'],
  'комплект': ['kit', 'set', 'pack'],
  'набор': ['kit', 'set'],
};

// ── Cyrillic detection ─────────────────────────────────

const CYRILLIC = /[а-яё]/i;

export function isCyrillic(text: string): boolean {
  return CYRILLIC.test(text);
}

// ── Translation ────────────────────────────────────────

/**
 * Translate a Russian search query into English search terms.
 * Known words are translated; unknown words are kept as-is (for brand/SKU matching).
 * Returns an array of English search phrases to try.
 */
export function translateQuery(russianQuery: string): string {
  if (!isCyrillic(russianQuery)) return russianQuery;

  const words = russianQuery.toLowerCase().split(/\s+/);
  const translated: string[] = [];

  for (const word of words) {
    const eng = TRANSLATIONS[word];
    if (eng && eng[0]) {
      // Use only the first (most direct) translation to keep search targeted
      translated.push(eng[0]);
    } else {
      // Unknown word — keep as-is for brand/SKU matching
      translated.push(word);
    }
  }

  return translated.join(' ');
}

/**
 * Generate multiple search variations for a Russian query.
 * Returns the original + English translation for maximum coverage.
 */
export function expandRussianQuery(query: string): string[] {
  if (!isCyrillic(query)) return [query];

  const translated = translateQuery(query);
  if (translated === query) return [query];

  return [query, translated];
}
