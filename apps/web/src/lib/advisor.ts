/**
 * Shared logic for the product advisor (used by the homepage form and the
 * /podbor results page). Kept framework-agnostic so it works in both a client
 * component and a server component.
 */
import type { BrandConfig } from '@/config/brands/types';

export interface AdvisorOption {
  value: string;
  label: string;
}

export const CATEGORY_OPTIONS: AdvisorOption[] = [
  { value: '', label: 'Выберите категорию' },
  { value: 'bezopasnost', label: 'СИЗ (защита)' },
  { value: 'instrumenty', label: 'Инструменты' },
  { value: 'krepezh', label: 'Крепёж' },
  { value: 'elektrika', label: 'Электрика' },
  { value: 'pnevmatika', label: 'Пневматика' },
  { value: 'gidravlika', label: 'Гидравлика' },
  { value: 'any', label: 'Всё равно' },
];

export const INDUSTRY_OPTIONS: AdvisorOption[] = [
  { value: '', label: 'Выберите отрасль' },
  { value: 'O&G', label: 'Нефть и газ' },
  { value: 'CNS', label: 'Строительство' },
  { value: 'MFG', label: 'Производство' },
  { value: 'ENG', label: 'Энергетика' },
  { value: 'MIN', label: 'Горная добыча' },
  { value: 'LOG', label: 'Логистика' },
  { value: 'any', label: 'Любая' },
];

export const CONDITION_OPTIONS: AdvisorOption[] = [
  { value: '', label: 'Выберите условия' },
  { value: 'chemical', label: 'Химстойкость' },
  { value: 'heat', label: 'Высокие температуры' },
  { value: 'explosion', label: 'Взрывозащита (ATEX)' },
  { value: 'moisture', label: 'Влажность / вода' },
  { value: 'any', label: 'Не важно' },
];

/** Human-readable label lookups (for the results page heading). */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.filter((o) => o.value && o.value !== 'any').map((o) => [o.value, o.label]),
);
export const INDUSTRY_LABELS: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.filter((o) => o.value && o.value !== 'any').map((o) => [o.value, o.label]),
);

// Advisor industry codes → substrings found in BrandConfig.industries (Russian).
export const INDUSTRY_TAGS: Record<string, string[]> = {
  'O&G': ['нефтегаз', 'нефть', 'газ'],
  CNS: ['строительств', 'строит'],
  MFG: ['промышленн', 'производств', 'металлообработк', 'автомобилестроен', 'автосервис'],
  ENG: ['энергетик'],
  MIN: ['горн', 'добыч'],
  LOG: ['логистик', 'транспорт'],
};

export function brandMatchesIndustry(brand: BrandConfig, industry: string): boolean {
  if (!industry || industry === 'any') return true;
  const tags = INDUSTRY_TAGS[industry] ?? [];
  return brand.industries.some((ind) => tags.some((t) => ind.toLowerCase().includes(t)));
}

export const CONDITION_LABELS: Record<string, string> = Object.fromEntries(
  CONDITION_OPTIONS.filter((o) => o.value && o.value !== 'any').map((o) => [o.value, o.label]),
);

// Keywords (RU + EN) that mark a product as satisfying a given condition.
// Matched against title + descriptions + attribute/spec KEYS *and* values
// (many condition signals live in the attribute name, e.g. "EN ISO 374").
export const CONDITION_KEYWORDS: Record<string, string[]> = {
  chemical: ['химстой', 'химическ', 'кислот', 'маслостой', 'нефтемаслостой', 'chemical', 'en iso 374', 'solvent', 'acid'],
  heat: ['жаро', 'термост', 'термос', 'огнест', 'огнеупор', 'огнезащ', 'flame', 'fire resist', 'fire-resist', 'arc rating', 'arc flash', 'atpv', 'heat resist', 'high temp', 'high-temp', 'flame resist', 'flame-resist', 'fr '],
  explosion: ['atex', 'взрыв', 'искробезопас', 'explosion proof', 'explosion-proof', 'intrinsically safe', 'iecex', 'ex-proof', 'ex proof'],
  moisture: ['влаг', 'водонепрониц', 'водостой', 'водоотталк', 'гидроизол', 'waterproof', 'water resist', 'water-resist', 'weatherproof', 'ip65', 'ip66', 'ip67', 'ip68', 'moisture'],
};

interface ConditionCheckable {
  title?: string | null;
  description?: string | null;
  descriptionRu?: string | null;
  attributes?: Record<string, string> | null;
  specifications?: Record<string, string> | null;
}

export function productMatchesCondition(p: ConditionCheckable, condition: string): boolean {
  if (!condition || condition === 'any') return true;
  const kw = CONDITION_KEYWORDS[condition];
  if (!kw) return true;
  const parts: string[] = [p.title ?? '', p.descriptionRu ?? '', p.description ?? ''];
  for (const obj of [p.attributes, p.specifications]) {
    if (obj) for (const [k, v] of Object.entries(obj)) parts.push(k, String(v));
  }
  const haystack = parts.join(' ').toLowerCase();
  return kw.some((k) => haystack.includes(k));
}
