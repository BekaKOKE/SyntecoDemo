import type { BrandProduct } from '../types';
import { buildProducts, type ProductRow, type ProductTables } from './build';

/**
 * PIP Warning Beacons — the Eflare(R) range, mirrored from
 * https://us.pipglobal.com/en/products/?scID=2567
 *
 * Names and catalog numbers stay in English: buyers search by PIP
 * nomenclature. Only the descriptions are localised.
 *
 * Generated — do not edit by hand.
 */

const SC_ID = 2567;

const TABLES: ProductTables = {
  /** Russian card copy, shared between products of the same family. */
  descriptions: {
    202: "Максимально повышает заметность дорожного треугольника. Виден с расстояния более 800 метров ночью. Работает от одной батарейки AA до 25 часов.",
    203: "Персональный сигнальный маяк, меньше и легче обычных e-flare.",
    204: "Линейка E-flare™ — не просто новинка, а спасение жизни. От обычного фонаря технология дошла до световых маяков с несколькими цветами и последовательностями, которые видно более чем за километр — без проблем со зрением в темноте, фиксацией взгляда и оценкой расстояния, свойственных стробоскопам и лампам накаливания.",
    205: "Персональный сигнальный маяк, меньше и легче обычных e-flare.",
    206: "Универсальное крепление для всех маяков E-Flare.",
    207: "Совмещённое магнитное основание и крышка. Подходит к любому маяку E-Flare.",
  },
  /** Russian application tags. */
  applications: {
    0: [],
  },
};

const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);

/** ccID 11601 — 7 products. */
export const eFlareBeacon: BrandProduct[] = build([
  [11601, "54270", "Eflare®", "Safety & Emergency Beacon for Safety Triangles - Flashing Red", "939-TB10-R", "/archive/pim/300/9/939-TB10-R---F.jpg", 202, 0, "4\"", "Red", 1],
  [11601, "25275", "Eflare®", "6\" Safety & Emergency Beacon - Flashing Amber", "939-EF350", "/archive/pim/300/5/939-EF350-A---F-on.jpg", 203, 0, "6\"", "Amber", 1],
  [11601, "144263", "Eflare®", "8\" Safety & Emergency Beacon - Flashing / Steady-On Red", "939-UB290-R", "/archive/pim/300/11/939-UB290-R.jpg", 204, 0, "8\"", "Red", 1],
  [11601, "47665", "Eflare®", "6\" Safety & Emergency Beacon with Steady-On Worklight and Magnetic Base - Flashing Blue", "939-TF250-B-ASY", "/archive/pim/300/5/939-TF250-B---F-on.jpg", 203, 0, "6\"", "Blue", 1],
  [11601, "25276", "Eflare®", "6\" Safety & Emergency Beacon - Flashing Red", "939-EF350", "/archive/pim/300/5/939-EF350-R---F-on.jpg", 205, 0, "Compact 6\" High", "Red", 1],
  [11601, "4316", "Eflare®", "Rubber Base Mount", "939-EFBASE", "/archive/pim/300/5/939-EFBASE---F.jpg", 206, 0, "OS", "Black", 1],
  [11601, "13258", "Eflare®", "Magnetic Base Mount", "939-EFMAGBASE", "/archive/pim/300/5/939-EFMAGBASE---F.jpg", 207, 0, "OS", "Black", 1],
]);

/** Every product of this category, keyed by PIP ccID. */
export const pipWarningBeacons: Record<string, BrandProduct[]> = {
  '11601': eFlareBeacon,
};
