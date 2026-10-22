import { classifyCatalogCategory, sourceCategoryParts } from './catalog-taxonomy';
import { CURATED_ASSIGNMENTS } from './catalog-curated-assignments';
import * as fs from 'fs';
import * as path from 'path';

describe('catalog taxonomy classifier', () => {
  it.each([
    ['Product Categories > Safety > Hand & Arm Protection > Safety Gloves', 'zashchita-ruk'],
    ['Product Categories/Tools/Power Tools/Power Tool Replacement Parts', 'elektroinstrumenty'],
    ['Product Categories > Machining > Drilling & Holemaking > Drill Bits', 'sverlenie'],
    ['Product Categories > Electrical > Fuses, Circuit Breakers & Safety Switches', 'avtomaty-predohraniteli'],
    ['Product Categories > Pneumatics > Pneumatic Valves', 'pnevmo-klapany'],
    ['Product Categories > Hydraulics > Hydraulic Pumps', 'gidro-nasosy'],
    ['Product Categories > Hydraulics > Hydraulic Cylinders & Seals > Rod Wipers', 'gidro-uplotneniya'],
    ['Product Categories > Fasteners > Bolts & Screws', 'bolty-vinty'],
    ['Product Categories > Power Transmission > Bearings', 'podshipniki-main'],
    ['Product Categories > Power Transmission > Rotary Shaft Sealing > Rotary Shaft Oil Seals', 'uplotneniya-valov'],
    ['Product Categories > Motors > AC Motors', 'ac-dvigateli'],
    ['Product Categories > Welding > Stud Welding', 'shpilkosvarka'],
    ['Product Categories > Pipe, Hose, Tube & Fittings > Pipe & Pipe Fittings', 'truby-fitingi'],
    ['Product Categories > Pipe, Hose, Tube & Fittings > Hose Products > Chemical Hoses', 'shlangi-rukava'],
    ['Product Categories > Cleaning and Janitorial > Waste, Recycling & Trash Supplies', 'musor-pererabotka'],
    ['Product Categories > Material Handling > Storage & Workspace', 'skladskoe-hranenie'],
    ['Product Categories > Lab Supplies > Lab Filters and Sieving', 'laboratornye-filtry'],
    ['Product Categories > Fleet & Vehicle Maintenance > Brakes, Tires, & Wheels Maintenance', 'shiny-tormoza'],
    ['Product Categories > Raw Materials > Metals > Tool Steel', 'metalloprokat'],
    ['Product Categories > Office Supplies > Printers, Ink and Toners', 'rashodniki-dlya-pechati'],
    ['Product Categories > Furnishings, Appliances & Hospitality > Window Treatments', 'obustroystvo-pomeshcheniy'],
    ['Product Categories > Security > Locks > Door Locks', 'zamki-i-klyuchi'],
    ['Product Categories > Safety > Signs & Facility Identification Products > Label Makers & Supplies', 'znaki-bezopasnosti'],
    ['Product Categories > Paints, Equipment and Supplies > Painting Equipment > Paint Spray Guns & Systems', 'okrasochnoe-oborudovanie'],
    ['Product Categories > Outdoor Equipment > Pressure Washers > Electric Pressure Washers', 'moyki-vysokogo-davleniya'],
  ])('maps %s to %s', (product_category, expected) => {
    expect(classifyCatalogCategory({ product_category })?.slug).toBe(expected);
  });

  it('uses category_tree when product_category is absent', () => {
    expect(classifyCatalogCategory({
      category_tree: [
        { name: 'Product Categories' },
        { name: 'Safety' },
        { name: 'Respiratory Protection' },
      ],
    })?.slug).toBe('respirators');
  });

  it('normalizes slash and chevron paths consistently', () => {
    expect(sourceCategoryParts({ product_category: 'Product Categories/Safety/Fire Protection' }))
      .toEqual(['safety', 'fire protection']);
  });

  // The raw supplier exports (data/Grainger*.json, ~13 MB) are not in git;
  // run this check only where they are present.
  const dataDir = path.resolve(__dirname, '..', '..', '..', 'data');
  const itWithSourceData = fs.existsSync(path.join(dataDir, 'Grainger.json')) ? it : it.skip;

  itWithSourceData('classifies every source catalog row or handles it with an explicit curated decision', () => {
    const rows = ['Grainger.json', 'Grainger_batch2.json'].flatMap(file =>
      JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) as Array<{
        variant_id?: string;
        product_category?: string | null;
        category_tree?: Array<{ name?: string | null }> | null;
      }>,
    );

    const unresolved = rows.filter(row =>
      !Object.prototype.hasOwnProperty.call(CURATED_ASSIGNMENTS, row.variant_id ?? '')
      && !classifyCatalogCategory(row),
    );

    expect(unresolved).toEqual([]);
  });
});
