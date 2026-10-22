import type { BrandProduct } from '../types';
import { buildProducts, type ProductRow, type ProductTables } from './build';

/**
 * PIP Ergonomics products — back, wrist, elbow and knee supports,
 * mirrored from https://us.pipglobal.com/en/products/?scID=2564
 *
 * Names and catalog numbers stay in English: buyers search by PIP
 * nomenclature. Only the descriptions are localised.
 *
 * Generated — do not edit by hand.
 */

const SC_ID = 2564;

const TABLES: ProductTables = {
  /** Russian card copy, shared between products of the same family. */
  descriptions: {
    2: "Для тяжёлых условий труда: удерживает стабильность корпуса и снижает риск травм спины.",
    3: "Лёгкая эластичная лента. Одинарная петля на большой палец удерживает бандаж на месте. Застёжка-липучка.",
    4: "Снижает риск травм запястья, удерживая его в нейтральном положении.",
    5: "Обеспечивает лечебное прогревание: снимает напряжение и расслабляет мышцы.",
    6: "Снимает мышечное напряжение и давление в области локтя от повторяющихся движений.",
    7: "Снижает напряжение, растяжение и отёк, добавляет стабильности.",
    8: "Сочетает эффективность и мягкое тепло неопрена с комфортом и универсальностью обхватывающего бандажа.",
    9: "Для работы на твёрдых поверхностях, бетоне, кровле, подъездных путях и в грузовых зонах — защищает колени от травм.",
    10: "Защищает колени от травм при постоянной работе на коленях. Стойкие к истиранию, удобны при разворотах.",
    11: "Защищает колени от травм при постоянной работе на коленях. Для деликатных поверхностей.",
  },
  /** Russian application tags. */
  applications: {
    0: [],
  },
};

const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);

/** ccID 11614 — 9 products. */
export const ergonomicSupports: BrandProduct[] = build([
  [11614, "49501", "PIP®", "Black Mesh Back Support Belt", "290-440", "/archive/pim/300/3/290-440---B.jpg", 2, 0, "S, M, L, XL, 2XL", "Black", 1],
  [11614, "34105", "PIP®", "Elastic Wrist Wrap with Thumb Loop", "290-9011", "/archive/pim/300/3/290-9011---OM.jpg", 3, 0, "OS", "Black", 1],
  [11614, "21843", "PIP®", "High Visibility Lime Yellow Back Support Belt", "290-550", "/archive/pim/300/3/290-550---OMB.jpg", 2, 0, "M, L, XL, 2XL", "Hi-Vis Yellow", 1],
  [11614, "34111", "PIP®", "Single Wrap Ambidextrous Wrist Support", "290-9013", "/archive/pim/300/3/290-9013---OM.jpg", 4, 0, "S, M, L, XL", "Black", 1],
  [11614, "34122", "PIP®", "Knee Sleeve", "290-9020", "/archive/pim/300/3/290-9020---FL.jpg", 5, 0, "S, M, L, XL", "Black", 1],
  [11614, "34095", "PIP®", "Elbow Support", "290-9000", "/archive/pim/300/3/290-9000.jpg", 6, 0, "M, L, XL", "Black", 1],
  [11614, "34099", "PIP®", "Elbow Sleeve", "290-9001", "/archive/pim/300/3/290-9001.jpg", 5, 0, "S, M, L, XL", "Black", 1],
  [11614, "34103", "PIP®", "Stretchable Wrist Support", "290-9010", "/archive/pim/300/3/290-9010---OM.jpg", 7, 0, "OS", "Black", 1],
  [11614, "49148", "PIP®", "Light Neoprene Wrist Support", "290-9015", "/archive/pim/300/3/290-9015---OM.jpg", 8, 0, "OS", "Black", 1],
]);

/** ccID 11564 — 3 products. */
export const kneeProtection: BrandProduct[] = build([
  [11564, "21792", "PIP®", "Clear Flat Cap Gel Knee Pads", "291-130", "/archive/pim/300/3/291-130---F.jpg", 9, 0, "OS", "Clear", 1],
  [11564, "21790", "PIP®", "Hard Plastic Cap Knee Pads", "291-100", "/archive/pim/300/3/291-100---F.jpg", 10, 0, "OS", "Gray", 1],
  [11564, "21791", "PIP®", "Non-Marring Knee Pads", "291-110", "/archive/pim/300/3/291-110---F.jpg", 11, 0, "OS", "White", 1],
]);

/** Every product of this category, keyed by PIP ccID. */
export const pipErgonomics: Record<string, BrandProduct[]> = {
  '11614': ergonomicSupports,
  '11564': kneeProtection,
};
