import { OFFICIAL_BRANDS } from '@/config/brands';
import type {
  BrandCatalogCategory,
  BrandCatalogSubcategory,
} from '@/config/brands/types';

/**
 * Client-side search over the official brand catalogs (productCatalog in
 * each BrandConfig). Lets the /search page surface manufacturer catalog
 * sections — e.g. the query «респираторы» returns PIP Respiratory
 * Protection (Disposable Masks, Escape Solutions, …), uvex Respiratory
 * protection (FFP 1/2/3), SATA, Honeywell etc.
 *
 * Matching is dictionary-based: Russian (and English) query stems expand
 * into English catalog terms, which are then matched against category and
 * subcategory names. Russian text also matches against descriptionRu.
 */

export interface CatalogSearchMatch {
  brandSlug: string;
  brandName: string;
  brandColor: string;
  logoUrl: string;
  website: string;
  category: BrandCatalogCategory;
  /** Subcategories that matched (all of them when the category matched). */
  subcategories: BrandCatalogSubcategory[];
}

/**
 * RU/EN stems → English catalog terms.
 *
 * `stems` are matched as substrings of the normalized query (so
 * «респираторы», «респиратора», «respirators» all hit). `terms` are matched
 * as substrings of category/subcategory names (lowercased).
 */
const SYNONYMS: { stems: string[]; terms: (string | RegExp)[] }[] = [
  {
    stems: ['респиратор', 'respirator', 'сизод', 'дыхан', 'противогаз', 'полумаск', 'ffp'],
    terms: ['respirat', 'facepiece', 'scba', 'supplied air', 'air-purifying', 'ffp', 'escape', 'silv-air', 'air vision', 'air star', 'breathing'],
  },
  {
    stems: ['маск', 'mask'],
    // «masking tape» / «wheel maskers» — не маски, поэтому RegExp.
    terms: [/mask(?!ing|er)/, 'respirat', 'facepiece', 'ffp', 'face cover'],
  },
  {
    stems: ['очк', 'goggle', 'glasses', 'spectacle', 'линз'],
    terms: ['glasses', 'goggle', 'spectacle', 'eyewear', 'eye protection', 'hypervision'],
  },
  {
    stems: ['защита глаз', 'глаз'],
    terms: ['eye protection', 'eyewear', 'glasses', 'goggle', 'spectacle', 'eyewash'],
  },
  {
    stems: ['щиток', 'щитк', 'защита лица', 'лицев', 'face shield', 'visor'],
    terms: ['face protection', 'face shield', 'visor'],
  },
  {
    stems: ['перчатк', 'glove', 'рукавиц'],
    terms: ['glove', 'hand protection'],
  },
  {
    stems: ['нарукавник', 'sleeve'],
    terms: ['sleeve', 'arm protection'],
  },
  {
    stems: ['каск', 'шлем', 'helmet', 'hard hat', 'подшлемник'],
    terms: ['hard hat', 'helmet', 'head protection', 'bump cap', 'winter cap'],
  },
  {
    stems: ['наушник', 'беруш', 'слух', 'hearing', 'earplug', 'ear plug'],
    terms: ['hearing', 'ear muff', 'ear plug', 'earplug', 'otoplastic', 'axess'],
  },
  {
    stems: ['обув', 'ботин', 'сапог', 'boot', 'footwear', 'башмак', 'сандал'],
    terms: ['footwear', 'boot', 'shoe', 'sandal', 'trainer'],
  },
  {
    stems: ['одежд', 'костюм', 'комбинезон', 'куртк', 'apparel', 'clothing', 'спецодежд', 'жилет'],
    terms: ['clothing', 'apparel', 'workwear', 'rainwear', 'wear', 'aprons', 'coverall', 'suxxeed', 'corporate'],
  },
  {
    stems: ['сигнальн', 'светоотража', 'hi-vis', 'hi vis'],
    terms: ['hi-vis', 'warning beacon', 'e-flare'],
  },
  {
    stems: ['падени', 'привяз', 'страховочн', 'строп', 'harness', 'lanyard', 'анкер', 'высот'],
    terms: ['fall protection', 'harness', 'lanyard', 'lifeline', 'anchorage', 'srl', 'rope', 'descent', 'tether', 'body belt'],
  },
  {
    stems: ['сварк', 'сварочн', 'сварщик', 'weld'],
    terms: ['welding'],
  },
  {
    stems: ['аптечк', 'первая помощь', 'first aid', 'пластыр', 'бинт'],
    terms: ['first aid', 'plaster', 'bandage', 'wound'],
  },
  {
    stems: ['промывк', 'промыван', 'eyewash', 'душ'],
    terms: ['eyewash', 'wound', 'station', 'decontamination'],
  },
  {
    stems: ['химическ', 'химзащит', 'chemical'],
    terms: ['chemical'],
  },
  {
    stems: ['порез', 'cut resist'],
    terms: ['cut resistant', 'cut protection'],
  },
  {
    stems: ['одноразов', 'disposable'],
    terms: ['disposable'],
  },
  {
    stems: ['диэлектрическ', 'электробезопасн', 'дуг', 'arc flash'],
    terms: ['electrical safety', 'arc ', 'insulating'],
  },
  {
    stems: ['огнестойк', 'огнеупорн', ' fr ', 'жаростойк'],
    terms: ['fr clothing', 'fr hood', 'protection from heat'],
  },
  {
    stems: ['наколенник', 'колен', 'knee'],
    terms: ['knee'],
  },
  {
    stems: ['эргоном', 'поясниц', 'пояс'],
    terms: ['ergonomic', 'body belt'],
  },
  {
    stems: ['газоанализатор', 'газодетект', 'детектор газа', 'gas detect', 'газосигнализатор'],
    terms: ['gas detection', 'gas & flame', 'gas and flame', 'portable gas', 'fixed gas', 'gas measurement', 'gas sampling', 'leak detection'],
  },
  {
    stems: ['датчик', 'sensor', 'сенсор'],
    terms: ['sensor', 'sensing', 'switches', 'test & measurement'],
  },
  {
    stems: ['огнетушител', 'пожаротушен', 'extinguish', 'пена', 'foam'],
    terms: ['extinguisher', 'foam', 'suppression', 'fire-fighting', 'restaurant system', 'vehicle system', 'industrial system', 'spill control'],
  },
  {
    stems: ['спринклер', 'sprinkler', 'оросител'],
    terms: ['sprinkler', 'nozzle', 'grooved', 'valves'],
  },
  {
    stems: ['пожарн', 'fire'],
    terms: ['fire', 'firefighter', 'sprinkler', 'extinguisher', 'foam', 'suppression', 'escape'],
  },
  {
    stems: ['фонар', 'torch', 'flashlight', 'освещен'],
    terms: ['torch', 'flashlight', 'lighting', 'beacon'],
  },
  {
    stems: ['кейс', 'чемодан', 'ящик', 'кофр', 'case'],
    terms: ['case', 'cooler', 'luggage'],
  },
  {
    stems: ['замок', 'замк', 'блокировк', 'lockout', 'padlock', 'навесн'],
    terms: ['lock', 'padlock', 'lockout', 'tagout', 'safes', 'door hardware'],
  },
  {
    stems: ['краскопульт', 'покрасочн', 'spray gun', 'распылител', 'окрасочн'],
    terms: ['spray gun', 'cup system', 'satajet', 'sataminijet', 'satagraph'],
  },
  {
    stems: ['фильтр', 'filter', 'фильтрац'],
    terms: ['filter', 'filtration'],
  },
  {
    stems: ['абразив', 'шлифовал', 'abrasive'],
    terms: ['abrasive', 'compounds & polishes'],
  },
  {
    stems: ['клей', 'клеев', 'герметик', 'adhesive', 'скотч', 'лент'],
    terms: ['adhesive', 'sealant', 'tape'],
  },
  {
    stems: ['чист', 'cleanroom', 'стерильн'],
    terms: ['cleanroom', 'controlled environment', 'ce ', 'clean'],
  },
  {
    stems: ['холод', 'зимн', 'утепл', 'согрева'],
    terms: ['cold', 'winter', 'warming', 'heated apparel'],
  },
  {
    stems: ['жар', 'охлажда', 'cooling', 'терморегул'],
    terms: ['cooling', 'heat stress', 'hydration', 'sun protection', 'protection from heat'],
  },
  {
    stems: ['сиз', 'ppe', 'индивидуальной защит'],
    terms: ['personal protective equipment', 'ppe'],
  },
];

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').trim();

type Term = string | RegExp;

const termHits = (text: string, term: Term): boolean =>
  typeof term === 'string' ? text.includes(norm(term)) : term.test(text);

/** Expand a normalized query into English catalog terms + raw tokens. */
function expandTerms(q: string): Term[] {
  const padded = ` ${q} `;
  const terms = new Set<Term>();
  for (const { stems, terms: t } of SYNONYMS) {
    if (stems.some((stem) => (stem.includes(' ') || stem.trim().length < 4 ? padded.includes(stem) : q.includes(stem)))) {
      t.forEach((term) => terms.add(term));
    }
  }
  // Raw tokens (≥3 chars) also match directly — covers English queries and
  // brand nomenclature («satajet», «altair», «ffp3» → «ffp»).
  for (const token of q.split(/[^a-zа-я0-9-]+/i)) {
    if (token.length >= 3) terms.add(token);
  }
  return [...terms];
}

/**
 * Search all official brand catalogs. Returns matches grouped per
 * brand+category; when the category itself matches, all its subcategories
 * are returned, otherwise only the matching subcategories.
 */
export function searchBrandCatalogs(query: string): CatalogSearchMatch[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const terms = expandTerms(q);
  if (terms.length === 0) return [];

  const matches: CatalogSearchMatch[] = [];

  for (const brand of OFFICIAL_BRANDS) {
    if (!brand.productCatalog) continue;
    for (const cat of brand.productCatalog) {
      const subs = cat.subcategories ?? [];
      const nameText = norm(`${cat.name} ${cat.slug.replace(/-/g, ' ')}`);
      const descText = norm(cat.description ?? '');
      const catRu = norm(cat.descriptionRu ?? '');

      // Совпадение по НАЗВАНИЮ категории (например «Respiratory Protection»
      // для запроса «респираторы») — берём все подкатегории целиком.
      const nameHit = terms.some((t) => termHits(nameText, t));
      // Совпадение только по описанию (например Honeywell «Personal
      // Protective Equipment» упоминает respiratory) — тогда берём лишь
      // подходящие подкатегории, а не весь зонтичный раздел.
      const descHit =
        terms.some((t) => termHits(descText, t)) ||
        (catRu.length > 0 && q.length >= 4 && catRu.includes(q));

      const subMatches = subs.filter((s) => {
        const name = norm(s.name);
        return terms.some((t) => termHits(name, t));
      });

      let matched: BrandCatalogSubcategory[];
      if (nameHit) {
        matched = subs;
      } else if (subMatches.length > 0) {
        matched = subMatches;
      } else if (descHit) {
        matched = subs;
      } else {
        matched = [];
      }
      const categoryHit = nameHit || descHit;
      if (matched.length > 0 || (categoryHit && subs.length === 0)) {
        matches.push({
          brandSlug: brand.slug,
          brandName: brand.name,
          brandColor: brand.heroColor,
          logoUrl: brand.logoUrl,
          website: brand.website,
          category: cat,
          subcategories: matched,
        });
      }
    }
  }

  return matches;
}

/** Total number of subcategory tiles across matches. */
export function countCatalogLinks(matches: CatalogSearchMatch[]): number {
  return matches.reduce((sum, m) => sum + Math.max(m.subcategories.length, 1), 0);
}
