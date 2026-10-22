export const CATALOG_ROOT_SLUGS = [
  'bezopasnost', 'instrumenty', 'elektrika', 'pnevmatika', 'gidravlika',
  'krepezh', 'podshipniki', 'dvigateli', 'svarka', 'santekhnika',
  'uborka', 'upakovka', 'laboratoriya', 'avtopark',
  'syrye-materialy', 'mebel-i-hoztovary', 'promyshlennaya-furnitura',
  'ofisnye-tovary', 'ohrannye-sistemy', 'lakokrasochnye-materialy', 'ulichnoe-oborudovanie',
] as const;

export type CatalogRootSlug = (typeof CATALOG_ROOT_SLUGS)[number];

export interface SourceCategoryInput {
  product_category?: string | null;
  category_tree?: Array<{ name?: string | null }> | null;
}

export interface CatalogClassification {
  slug: string;
  rootSlug: CatalogRootSlug;
  sourcePath: string;
}

function normalizePart(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function sourceCategoryParts(input: SourceCategoryInput): string[] {
  const rawPath = input.product_category?.trim();
  const rawParts = rawPath
    ? rawPath.split(/\s*>\s*|\/+\s*/)
    : (input.category_tree ?? []).map(item => item.name ?? '');

  return rawParts.map(normalizePart).filter(Boolean).filter(part => part !== 'product categories');
}

function includesAny(text: string, values: string[]): boolean {
  return values.some(value => text.includes(value));
}

function classifySafety(path: string): string {
  if (includesAny(path, ['respiratory protection', 'respirator'])) return 'respirators';
  if (includesAny(path, ['hand & arm protection', 'hand and arm protection', 'safety gloves'])) return 'zashchita-ruk';
  if (includesAny(path, ['eye & face protection', 'eye and face protection', 'safety glasses', 'goggles'])) return 'zashchita-glaz';
  if (includesAny(path, ['hearing protection', 'earplug', 'ear muff'])) return 'zashchita-slukha';
  if (includesAny(path, ['fire protection', 'fire extinguisher'])) return 'fire-extinguishers';
  if (includesAny(path, ['lockout tagout', 'lockout/tagout', 'lockout', 'tagout'])) return 'loto-locks';
  if (includesAny(path, ['workwear', 'protective clothing', 'uniforms', 'work apparel', 'clothing'])) return 'spetsodezhda';
  return 'siz';
}

function classifyTools(path: string): string {
  if (includesAny(path, ['abrasive', 'grinding wheel', 'sanding'])) return 'abrazivy';
  if (includesAny(path, ['drilling & holemaking', 'drill bit', 'hole saw'])) return 'sverlenie';
  if (includesAny(path, ['precision measuring', 'measuring & layout', 'measuring and layout'])) return 'izmeritelnyy-instrument';
  if (includesAny(path, ['toolholding', 'indexable cutting', 'milling', 'threading', 'turning, boring'])) return 'osnastka';
  if (includesAny(path, ['tool set', 'tool kit', 'sets'])) return 'nabory-instrumentov';
  if (includesAny(path, ['power tools', 'power saw'])) return 'elektroinstrumenty';
  if (includesAny(path, ['hand tools', 'sockets & bits', 'sockets and bits'])) return 'ruchnoy-instrument';
  return 'instrumenty-obshchie';
}

function classifyElectrical(path: string): string {
  if (includesAny(path, ['wire, cable', 'wire & cable', 'cordsets', 'extension cords'])) return 'kabeli';
  if (includesAny(path, ['connector', 'wiring devices', 'terminal', 'grounding'])) return 'razemy-klemmy';
  if (includesAny(path, ['boxes & enclosures', 'boxes and enclosures', 'enclosure'])) return 'shchity-korpusa';
  if (includesAny(path, ['fuses, circuit breakers', 'circuit breaker', 'safety switch'])) return 'avtomaty-predohraniteli';
  if (includesAny(path, ['motor controls', 'relay', 'contactor', 'starter'])) return 'rele-kontaktory';
  if (includesAny(path, ['lighting', 'light bulbs', 'lamps'])) return 'osveshchenie';
  if (includesAny(path, ['wire & cable management', 'wire and cable management', 'conduit', 'raceway'])) return 'kabel-kanaly';
  if (includesAny(path, ['industrial controls', 'automation', 'sensor', 'test instruments'])) return 'kipia';
  return 'elektrika-obshchaya';
}

function classifyPneumatics(path: string): string {
  if (includesAny(path, ['actuator', 'air cylinder', 'pneumatic cylinder'])) return 'pnevmo-tsilindry';
  if (includesAny(path, ['pneumatic tools', 'air tool'])) return 'pnevmo-instrument';
  if (includesAny(path, ['pneumatic valves', 'air valve'])) return 'pnevmo-klapany';
  if (includesAny(path, ['compressor', 'vacuum pump', 'blower'])) return 'kompressory';
  if (includesAny(path, ['compressed air treatment', 'filter regulator', 'lubricator'])) return 'podgotovka-vozduha';
  if (includesAny(path, ['fitting', 'push-to-connect'])) return 'pnevmo-fitingi';
  if (includesAny(path, ['hose', 'tubing'])) return 'pnevmo-shlangi';
  return 'pnevmatika-obshchaya';
}

function classifyHydraulics(path: string): string {
  if (includesAny(path, ['seal', 'o-ring', 'wiper'])) return 'gidro-uplotneniya';
  if (includesAny(path, ['hose', 'tube'])) return 'gidro-rukava';
  if (includesAny(path, ['cylinder', 'ram'])) return 'gidro-tsilindry';
  if (path.includes('pump')) return 'gidro-nasosy';
  if (includesAny(path, ['valve', 'flow control'])) return 'gidro-klapany';
  if (path.includes('fitting')) return 'gidro-fitingi';
  if (path.includes('tool')) return 'gidro-instrument';
  return 'gidravlika-obshchaya';
}

function classifyFasteners(path: string): string {
  if (includesAny(path, ['bolt', 'screw', 'threaded rods', 'threaded rod', 'studs'])) return 'bolty-vinty';
  if (path.includes('nuts')) return 'gayki';
  if (includesAny(path, ['washer', 'shim'])) return 'shayby';
  if (path.includes('anchor')) return 'ankery';
  if (includesAny(path, ['pins', 'key stock'])) return 'shtifty';
  if (path.includes('spring')) return 'pruzhiny';
  if (includesAny(path, ['seal', 'o-ring', 'gasket'])) return 'uplotneniya';
  if (includesAny(path, ['threaded insert', 'thread insert', 'helical insert'])) return 'rezbovye-vstavki';
  return 'krepezh-obshchiy';
}

function classifyPowerTransmission(path: string): string {
  if (includesAny(path, ['rotary shaft sealing', 'shaft seal'])) return 'uplotneniya-valov';
  if (path.includes('bearing')) return 'podshipniki-main';
  if (includesAny(path, ['belts & pulleys', 'belts and pulleys', 'v-belt', 'pulley'])) return 'remni-shkivy';
  if (includesAny(path, ['roller chain', 'sprocket'])) return 'tsepi-zvezdochki';
  if (includesAny(path, ['shaft coupling', 'universal joint'])) return 'mufty-valy';
  if (includesAny(path, ['rotary shaft', 'shaft collar'])) return 'valy';
  if (path.includes('linear motion')) return 'lineynoe-peremeshchenie';
  return 'transmissiya-obshchaya';
}

function classifyMotors(path: string): string {
  if (path.includes('gearmotor')) return 'motor-reduktory';
  if (includesAny(path, ['drive', 'speed control', 'vfd'])) return 'privody';
  if (path.includes('capacitor')) return 'kondensatory';
  if (path.includes('belt')) return 'remni';
  if (path.includes('coupling')) return 'mufty';
  if (includesAny(path, ['maintenance', 'accessories'])) return 'obsluzhivanie-dvigateley';
  return 'ac-dvigateli';
}

function classifyPlumbing(path: string): string {
  if (includesAny(path, ['seal', 'gasket', 'packing'])) return 'santeh-uplotneniya';
  if (includesAny(path, ['hose', 'reel'])) return 'shlangi-rukava';
  if (includesAny(path, ['pipe', 'tube', 'fitting'])) return 'truby-fitingi';
  if (path.includes('valve')) return 'klapany';
  if (path.includes('pump')) return 'nasosy';
  if (includesAny(path, ['filter', 'filtration', 'air treatment'])) return 'filtratsiya';
  if (includesAny(path, ['hvac', 'refrigeration', 'heater', 'air conditioner'])) return 'hvac';
  if (includesAny(path, ['ventilation', 'fan', 'blower'])) return 'ventilyatsiya';
  return 'santekhnika-obshchaya';
}

function classifyPackaging(path: string): string {
  if (includesAny(path, ['box', 'carton', 'bag', 'container'])) return 'korobki-tara';
  if (includesAny(path, ['tape', 'stretch wrap'])) return 'skotch-lenty';
  if (includesAny(path, ['strap', 'sling', 'load securing'])) return 'stropy';
  if (includesAny(path, ['label', 'tag', 'stencil', 'barcode'])) return 'markirovka';
  if (includesAny(path, ['storage', 'shelving', 'rack'])) return 'skladskoe-hranenie';
  if (includesAny(path, ['cart', 'truck', 'dolly', 'transporting', 'caster', 'wheel'])) return 'telezhki';
  if (includesAny(path, ['lifting', 'hoist', 'trolley', 'pulling', 'positioning'])) return 'podem-peremeshchenie';
  return 'upakovka-obshchaya';
}

function classifyLaboratory(path: string): string {
  if (includesAny(path, ['test instruments', 'measurement', 'tester', 'gauge', 'data recording'])) return 'izmeritelnye-pribory';
  if (includesAny(path, ['container', 'bottle', 'beaker', 'closures'])) return 'konteynery-emkosti';
  if (includesAny(path, ['filter', 'sieving', 'sieve'])) return 'laboratornye-filtry';
  if (path.includes('furniture')) return 'laboratornaya-mebel';
  if (includesAny(path, ['ventilation', 'enclosure', 'fume hood'])) return 'laboratornaya-ventilyatsiya';
  if (includesAny(path, ['temperature', 'cooling', 'refrigeration'])) return 'temperaturnyy-kontrol';
  return 'laboratornoe-oborudovanie';
}

function classifyCleaning(path: string): string {
  if (includesAny(path, ['chemical', 'cleaner', 'detergent', 'degreaser'])) return 'professionalnaya-himiya';
  if (includesAny(path, ['waste', 'recycling', 'trash'])) return 'musor-pererabotka';
  if (includesAny(path, ['paper towel', 'wipe', 'tissue'])) return 'bumaga-salfetki';
  if (path.includes('dispenser')) return 'dozatory';
  if (includesAny(path, ['floor cleaning machine', 'scrubber'])) return 'polomoechnye-mashiny';
  return 'inventar';
}

function classifyFleet(path: string): string {
  if (path.includes('filter')) return 'avto-filtry';
  if (includesAny(path, ['electrical', 'battery', 'lighting'])) return 'akb-elektrika';
  if (includesAny(path, ['oil', 'lubric', 'grease'])) return 'masla-smazki';
  if (includesAny(path, ['tire', 'brake', 'wheel'])) return 'shiny-tormoza';
  if (includesAny(path, ['trailer', 'towing'])) return 'pricepnoe-oborudovanie';
  if (includesAny(path, ['garage', 'jack'])) return 'garazhnoe-oborudovanie';
  if (path.includes('tool')) return 'avtoinstrument';
  return 'avtopark-obshchiy';
}

function classifyWelding(path: string): string {
  if (includesAny(path, ['filler metal', 'electrode', 'welding wire'])) return 'elektrody-provoloka';
  if (includesAny(path, ['gas equipment', 'torch', 'gas regulator'])) return 'gazovoe-oborudovanie';
  if (includesAny(path, ['welder', 'arc welding', 'welding machine'])) return 'svarochnye-apparaty';
  if (includesAny(path, ['solder', 'brazing'])) return 'payka';
  if (includesAny(path, ['helmet', 'welding glove', 'protection'])) return 'zaschita-svarshchika';
  if (path.includes('stud welding')) return 'shpilkosvarka';
  return 'svarka-obshchaya';
}

function classifyRawMaterials(path: string): string {
  if (includesAny(path, ['rubber', 'foam'])) return 'rezina-penomaterialy';
  if (includesAny(path, ['plastic', 'polyethylene', 'pvc', 'acetal', 'pei'])) return 'plastiki';
  if (includesAny(path, ['fiberglass', 'carbon fiber', 'fabric', 'composite'])) return 'kompozity-tehnicheskie-tkani';
  return 'metalloprokat';
}

function classifyFurnishings(path: string): string {
  if (includesAny(path, ['window treatment', 'flooring', 'wall base', 'doors', 'building supplies'])) return 'obustroystvo-pomeshcheniy';
  if (includesAny(path, ['hospitality supplies', 'housekeeping', 'garment rack'])) return 'gostinichnye-tovary';
  if (includesAny(path, ['fitness', 'sports', 'exercise equipment'])) return 'sportivnyy-inventar';
  if (includesAny(path, ['appliances', 'replacement parts', 'equipment parts'])) return 'bytovaya-tehnika-zapchasti';
  if (includesAny(path, ['tableware', 'food service', 'cookware', 'cutlery', 'buffet', 'concession', 'breakroom'])) return 'obshchepit';
  return 'promyshlennaya-mebel';
}

function classifyHardware(path: string): string {
  if (includesAny(path, ['door hardware', 'window hardware', 'hinge', 'handle', 'pulls & knobs', 'pulls and knobs'])) return 'dvernaya-furnitura';
  if (includesAny(path, ['vibration control', 'leveling mount'])) return 'vibroopory';
  if (includesAny(path, ['protective caps', 'caps, plugs', 'caps & plugs'])) return 'zaglushki-kolpachki';
  if (includesAny(path, ['hasp', 'latch', 'catch', 'hook', 'snap hook'])) return 'kryuki-zashchelki';
  if (includesAny(path, ['corner guard', 'wall protection', 'handrail'])) return 'poruchni-zashchita-sten';
  return 'promyshlennaya-furnitura-obshchaya';
}

function classifyOffice(path: string): string {
  if (includesAny(path, ['printer', 'ink', 'toner'])) return 'rashodniki-dlya-pechati';
  if (includesAny(path, ['computer supplies', 'tablet holder', 'media'])) return 'kompyuternye-aksessuary';
  if (includesAny(path, ['paper', 'notebook', 'writing', 'pen', 'pencil', 'marker', 'binder', 'clipboard', 'envelope'])) return 'kancelyariya';
  return 'ofisnoe-oborudovanie';
}

function classifySecurity(path: string): string {
  if (includesAny(path, ['locks', 'key control', 'key blank'])) return 'zamki-i-klyuchi';
  if (includesAny(path, ['video surveillance', 'camera', 'recorder'])) return 'videonablyudenie';
  if (includesAny(path, ['access barriers', 'turnstile', 'gate'])) return 'kontrol-dostupa';
  if (includesAny(path, ['id cards', 'badge', 'wristband'])) return 'identifikatsiya';
  if (includesAny(path, ['military', 'police', 'law enforcement', 'radio', 'weapon', 'holster'])) return 'sluzhebnaya-bezopasnost';
  return 'ohrannoe-oborudovanie';
}

function classifyPaint(path: string): string {
  if (includesAny(path, ['spray gun', 'spray system'])) return 'okrasochnoe-oborudovanie';
  if (includesAny(path, ['paint', 'coating']) && !includesAny(path, ['brush', 'applicator', 'tray', 'bucket'])) return 'kraski-pokrytiya';
  return 'malyarnyy-instrument';
}

function classifyOutdoor(path: string): string {
  if (path.includes('pressure washer')) return 'moyki-vysokogo-davleniya';
  if (includesAny(path, ['snow', 'ice removal'])) return 'snegouborka';
  if (includesAny(path, ['small engine', 'engine service'])) return 'malye-dvigateli';
  if (includesAny(path, ['pest control', 'rodent', 'insect'])) return 'borba-s-vreditelyami';
  return 'sadovyy-instrument';
}

export function classifyCatalogCategory(input: SourceCategoryInput): CatalogClassification | null {
  const parts = sourceCategoryParts(input);
  if (parts.length === 0) return null;

  const top = parts[0];
  const path = parts.join(' > ');
  const details = parts.slice(1).join(' > ');
  let rootSlug: CatalogRootSlug | null = null;
  let slug: string | null = null;

  const safetySignage = top === 'safety' && path.includes('signs & facility identification products');

  if (safetySignage) { rootSlug = 'bezopasnost'; slug = 'znaki-bezopasnosti'; }
  else if (top === 'safety') { rootSlug = 'bezopasnost'; slug = classifySafety(details); }
  else if (top === 'security' && includesAny(path, ['uniform', 'clothing', 'footwear', 'boots', 'public safety'])) {
    rootSlug = 'bezopasnost'; slug = classifySafety(details);
  } else if (includesAny(top, ['tools', 'machining', 'abrasives'])) { rootSlug = 'instrumenty'; slug = classifyTools(details); }
  else if (includesAny(top, ['electrical', 'electronics & batteries', 'lighting'])) { rootSlug = 'elektrika'; slug = classifyElectrical(details); }
  else if (top === 'pneumatics') { rootSlug = 'pnevmatika'; slug = classifyPneumatics(details); }
  else if (top === 'hydraulics') { rootSlug = 'gidravlika'; slug = classifyHydraulics(details); }
  else if (top === 'fasteners') { rootSlug = 'krepezh'; slug = classifyFasteners(details); }
  else if (top === 'hardware' && includesAny(path, ['sealing supplies', 'springs'])) {
    rootSlug = 'krepezh'; slug = classifyFasteners(details);
  } else if (top === 'power transmission' && path.includes('gearmotor')) {
    rootSlug = 'dvigateli'; slug = classifyMotors(details);
  } else if (top === 'power transmission') { rootSlug = 'podshipniki'; slug = classifyPowerTransmission(details); }
  else if (top === 'motors') { rootSlug = 'dvigateli'; slug = classifyMotors(details); }
  else if (top === 'welding') { rootSlug = 'svarka'; slug = classifyWelding(details); }
  else if (includesAny(top, ['plumbing', 'pipe, hose, tube & fittings', 'hvac and refrigeration', 'pumps'])) {
    rootSlug = 'santekhnika'; slug = classifyPlumbing(details);
  } else if (top === 'cleaning and janitorial') { rootSlug = 'uborka'; slug = classifyCleaning(details); }
  else if (top === 'packaging & shipping' || top === 'material handling') { rootSlug = 'upakovka'; slug = classifyPackaging(details); }
  else if (top === 'adhesives, sealants and tape' && path.includes('tape')) {
    rootSlug = 'upakovka'; slug = 'skotch-lenty';
  } else if (top === 'lab supplies' || top === 'test instruments') { rootSlug = 'laboratoriya'; slug = classifyLaboratory(details); }
  else if (top === 'fleet & vehicle maintenance' || top === 'lubrication') { rootSlug = 'avtopark'; slug = classifyFleet(details); }
  else if (top === 'raw materials') { rootSlug = 'syrye-materialy'; slug = classifyRawMaterials(details); }
  else if (includesAny(top, ['furnishings, appliances & hospitality', 'furniture, hospitality and food service'])) {
    rootSlug = 'mebel-i-hoztovary'; slug = classifyFurnishings(details);
  } else if (top === 'hardware') { rootSlug = 'promyshlennaya-furnitura'; slug = classifyHardware(details); }
  else if (top === 'office supplies') { rootSlug = 'ofisnye-tovary'; slug = classifyOffice(details); }
  else if (top === 'security') { rootSlug = 'ohrannye-sistemy'; slug = classifySecurity(details); }
  else if (top === 'paints, equipment and supplies') { rootSlug = 'lakokrasochnye-materialy'; slug = classifyPaint(details); }
  else if (top === 'outdoor equipment') { rootSlug = 'ulichnoe-oborudovanie'; slug = classifyOutdoor(details); }

  if (!rootSlug || !slug) return null;
  return { slug, rootSlug, sourcePath: parts.join(' > ') };
}
