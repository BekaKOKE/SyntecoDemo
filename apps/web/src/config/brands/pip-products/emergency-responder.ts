import type { BrandProduct } from '../types';
import { buildProducts, type ProductRow, type ProductTables } from './build';

/**
 * PIP Emergency Responder products — extrication gloves and fire/rescue
 * goggles, mirrored from https://us.pipglobal.com/en/products/?scID=2578
 *
 * Names and catalog numbers stay in English: buyers search by PIP
 * nomenclature. Only the descriptions are localised.
 *
 * Generated — do not edit by hand.
 */

const SC_ID = 2578;

const TABLES: ProductTables = {
  /** Russian card copy, shared between products of the same family. */
  descriptions: {
    0: "Для аварийно-спасательных работ, где нужна стойкость к проколам, теплу и истиранию с сохранением точной моторики.",
    1: "ESS X-Tricator™ — основная защита глаз для пожарных и служб скорой помощи, одна из самых популярных пожарно-спасательных масок ESS. Патентованное крепление Snap-On/Snap-Off™ позволяет носить маску в кармане и развернуть за секунды. Совместима с касками, лицевыми щитками и откидными линзами.",
  },
  /** Russian application tags. */
  applications: {
    0: [],
  },
};

const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);

/** ccID 11636 — 1 products. */
export const fireAndRescueGloves: BrandProduct[] = build([
  [11636, "8489", "PIP® AutoX™", "Extrication Glove", "911-AX9", "/archive/pim/300/5/911-AX9---UP.jpg", 0, 0, "S, M, L, XL", "Orange", 1],
]);

/** ccID 11635 — 1 products. */
export const fireAndRescueGoggle: BrandProduct[] = build([
  [11635, "4273", "PIP® X-Tricator™", "Fire & Rescue Helmet Goggle with Advanced ESS ClearZone™ FlowCoat Lens and Two-Piece Strap", "937-ESS01CB-EXS", "/archive/pim/300/5/937-ESS01CB-EXS---L.jpg", 1, 0, "Adjustable Size", "Gray", 1],
]);

/** Every product of this category, keyed by PIP ccID. */
export const pipEmergencyResponder: Record<string, BrandProduct[]> = {
  '11636': fireAndRescueGloves,
  '11635': fireAndRescueGoggle,
};
