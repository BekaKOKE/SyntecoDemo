import type { BrandProduct } from '../types';

/**
 * Shared builder for the mirrored PIP product tables.
 *
 * Every `pip-products/<category>.ts` file is a generated table of rows plus a
 * Russian description/tag lookup; this module turns those rows into
 * `BrandProduct`s and owns the two URL patterns, so the link rules live in
 * exactly one place.
 *
 *   manufacturerUrl -> /en/products/?scID=<sc>&ccID=<cc>&pID=<pid>
 *   datasheetUrl    -> /en/dynamic-spec-sheet-API.php?pID=<pid>
 *
 * The second one is PIP's own "VIEW SPEC SHEET" endpoint: it returns that
 * product's spec sheet as a PDF, generated on demand. Both are keyed on the
 * manufacturer's internal `pID`, which is what guarantees a card's buttons
 * point at that card's product and not at a category page.
 */

export const PIP_ORIGIN = 'https://us.pipglobal.com';

/** This product's page in the manufacturer catalog. */
export function pipProductUrl(scID: number, ccID: number, pid: string): string {
  return `${PIP_ORIGIN}/en/products/?scID=${scID}&ccID=${ccID}&pID=${pid}`;
}

/** This product's spec sheet (PDF). */
export function pipDatasheetUrl(pid: string): string {
  return `${PIP_ORIGIN}/en/dynamic-spec-sheet-API.php?pID=${pid}`;
}

/**
 * Manufacturer CDN image. Paths are encoded — a few PIP filenames contain
 * spaces (e.g. `399-HVBAT---PKG - BATTERY - CORD.jpg`) and would otherwise
 * silently fail to load.
 */
export function pipImageUrl(path: string): string {
  return `${PIP_ORIGIN}${encodeURI(path)}`;
}

/**
 * One generated row.
 *
 * `descKey` / `appKey` index into the file's Russian lookup tables — most
 * products in a PIP family share the same copy, so storing it once keeps the
 * generated tables an order of magnitude smaller.
 */
export type ProductRow = [
  ccID: number,
  pid: string,
  brand: string,
  name: string,
  sku: string,
  imagePath: string,
  descKey: number,
  appKey: number,
  sizes: string,
  colors: string,
  variants: number,
];

export interface ProductTables {
  /** Russian card descriptions, keyed by `descKey`. */
  descriptions: Record<number, string>;
  /** Russian application tags, keyed by `appKey`. */
  applications: Record<number, string[]>;
}

/** Turn generated rows into cards for one PIP super-category. */
export function buildProducts(
  scID: number,
  { descriptions, applications }: ProductTables,
  rows: ProductRow[],
): BrandProduct[] {
  return rows.map(
    ([ccID, pid, brand, name, sku, imagePath, descKey, appKey, sizes, colors, variants]) => ({
      pid,
      brand,
      name,
      sku,
      descriptionRu: descriptions[descKey] ?? '',
      tags: applications[appKey] ?? [],
      sizes,
      colors,
      variants,
      imageUrl: pipImageUrl(imagePath),
      manufacturerUrl: pipProductUrl(scID, ccID, pid),
      datasheetUrl: pipDatasheetUrl(pid),
    }),
  );
}

/** Group built products by their PIP ccID, the shape `pip-catalog` consumes. */
export function byCcId(products: BrandProduct[]): Record<string, BrandProduct[]> {
  const out: Record<string, BrandProduct[]> = {};
  for (const p of products) {
    const cc = p.manufacturerUrl.match(/ccID=(\d+)/)?.[1];
    if (!cc) continue;
    (out[cc] ??= []).push(p);
  }
  return out;
}
