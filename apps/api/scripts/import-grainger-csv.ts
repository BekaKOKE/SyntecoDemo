/**
 * Import Grainger products from CSV format (grainger_data_2022_01.csv).
 * Different format from the JSON scraper — more fields, pipe-separated attributes.
 *
 * Usage: npx tsx scripts/import-grainger-csv.ts [--dry-run] [--limit N]
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Grainger → Synteco KZ category mapping
const CATEGORY_MAP: Record<string, string> = {
  'product categories': null as any,
  safety: 'bezopasnost',
  security: 'bezopasnost',
  tools: 'instrumenty',
  electrical: 'elektrika',
  electronics: 'elektrika',
  lighting: 'elektrika',
  plumbing: 'santekhnika',
  hvac: 'santekhnika',
  'hvac and refrigeration': 'santekhnika',
  pneumatics: 'pnevmatika',
  hydraulics: 'gidravlika',
  fasteners: 'krepezh',
  hardware: 'krepezh',
  bearings: 'podshipniki',
  motors: 'dvigateli',
  'power transmission': 'dvigateli',
  welding: 'svarka',
  cleaning: 'uborka',
  janitorial: 'uborka',
  'janitorial & sanitation': 'uborka',
  packaging: 'upakovka',
  'material handling': 'sklad',
  lab: 'laboratoriya',
  'lab supplies': 'laboratoriya',
  fleet: 'avtopark',
  automotive: 'avtopark',
  'fleet and vehicle maintenance': 'avtopark',
  office: 'ofis',
  'office supplies': 'ofis',
  paint: 'kraski',
  'paint, equipment and supplies': 'kraski',
  abrasives: 'instrumenty',
  'cutting tools': 'instrumenty',
  'hand tools': 'instrumenty',
  'power tools': 'instrumenty',
  'test instruments': 'elektrika',
  'electrical supplies': 'elektrika',
  'plumbing supplies': 'santekhnika',
  adhesives: 'krepezh',
  'adhesives, sealants and tape': 'krepezh',
  tapes: 'krepezh',
  'filtration supplies': 'santekhnika',
};

const KZ_CATEGORIES: Record<string, string> = {
  bezopasnost: 'c0000001-0000-0000-0000-000000000001',
  instrumenty: 'c0000001-0000-0000-0000-000000000002',
  elektrika: 'c0000001-0000-0000-0000-000000000003',
  pnevmatika: 'c0000001-0000-0000-0000-000000000004',
  gidravlika: 'c0000001-0000-0000-0000-000000000005',
  krepezh: 'c0000001-0000-0000-0000-000000000006',
  podshipniki: 'c0000001-0000-0000-0000-000000000007',
  dvigateli: 'c0000001-0000-0000-0000-000000000008',
  svarka: 'c0000001-0000-0000-0000-000000000009',
  santekhnika: 'c0000001-0000-0000-0000-000000000010',
  uborka: 'c0000001-0000-0000-0000-000000000011',
  upakovka: 'c0000001-0000-0000-0000-000000000012',
  laboratoriya: 'c0000001-0000-0000-0000-000000000013',
  avtopark: 'c0000001-0000-0000-0000-000000000014',
  sklad: 'c0000001-0000-0000-0000-000000000015',
  ofis: 'c0000001-0000-0000-0000-000000000016',
  kraski: 'c0000001-0000-0000-0000-000000000017',
};

const WAREHOUSE_IDS = [
  'b0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000003',
  'b0000001-0000-0000-0000-000000000004',
];

// Brand dedup cache
const brandCache = new Map<string, string>();

async function getOrCreateBrand(name: string): Promise<string> {
  const key = name.trim();
  if (brandCache.has(key)) return brandCache.get(key)!;

  let brand = await prisma.brand.findUnique({ where: { name: key } });
  if (!brand) {
    const slug = key
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).slice(2, 8);
    brand = await prisma.brand.create({ data: { name: key, slug } });
    console.log(`  New brand: ${key}`);
  }
  brandCache.set(key, brand.id);
  return brand.id;
}

function mapCategory(graingerPath: string): string | null {
  const parts = graingerPath.toLowerCase().split('/');
  // Try each part of the path against the map
  for (let i = parts.length - 1; i >= 0; i--) {
    const cat = parts[i].trim();
    if (CATEGORY_MAP[cat]) return CATEGORY_MAP[cat];
  }
  // Try keyword matching
  const text = graingerPath.toLowerCase();
  for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
    if (slug && key !== 'product categories' && text.includes(key)) return slug;
  }
  return null;
}

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!raw || raw === 'None') return attrs;
  // Format: "Key: Value | Key: Value"
  const pairs = raw.split('|');
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx > 0) {
      const key = pair.slice(0, colonIdx).trim();
      const value = pair.slice(colonIdx + 1).trim();
      if (key && value) attrs[key] = value;
    }
  }
  return attrs;
}

function parsePrice(raw: string): number {
  // Format: "$9.37" or "$201.44"
  const cleaned = raw.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  // USD → KZT conversion rate: ~460 KZT/USD
  return Math.round(num * 460);
}

interface CsvRow {
  variantId: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  categoryPath: string;
  attributes: Record<string, string>;
  description: string;
  mpn: string;
}

function parseCsvLine(line: string): CsvRow | null {
  try {
    // Use simple CSV parsing with proper quote handling
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);

    if (fields.length < 15) return null;

    // Column mapping (0-indexed):
    // [0]=index, [1]=url, [2]=title, [3]=brand, [4]=itemId,
    // [5]=variantId/SKU, [6]=mpn/extraId, [7]=someNumber,
    // [8]=priceUSD, [9]=unit, [10]=listPrice,
    // [11]=attributes, [12]=imageUrl, [13]=categoryPath,
    // [14]=description, [15]=uuid, [16]=date

    const variantId = fields[5]?.trim();
    const title = fields[2]?.trim();
    if (!variantId || !title || variantId === '0') return null;

    const attributes = parseAttributes(fields[11] || '');
    const mpnField = fields[6]?.trim() || '';
    // Use [6] as MPN only if it looks like a manufacturer part number
    const mpn = mpnField && !mpnField.match(/^\d+\.?\d*$/) ? mpnField : '';

    return {
      variantId,
      title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      brand: fields[3]?.trim() || 'Unknown',
      price: parsePrice(fields[8] || '0'),
      imageUrl: (fields[12] || '').trim(),
      categoryPath: (fields[13] || '').trim(),
      attributes,
      description: (fields[14] || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(),
      mpn,
    };
  } catch {
    return null;
  }
}

async function importCsv(filePath: string, options: { dryRun?: boolean; limit?: number }) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  console.log(`File: ${filePath}`);
  console.log(`Lines: ${lines.length} (including header)`);
  if (options.dryRun) console.log('DRY RUN — no data will be written\n');

  // Parse header to verify format
  const header = lines[0];
  console.log(`Header: ${header.slice(0, 100)}...\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  const dataLines = lines.slice(1);
  const toProcess = options.limit ? dataLines.slice(0, options.limit) : dataLines;

  for (let idx = 0; idx < toProcess.length; idx++) {
    const row = parseCsvLine(toProcess[idx]);
    if (!row) { errors++; continue; }

    // Deduplicate by variantId
    const exists = await prisma.product.findUnique({ where: { variantId: row.variantId } });
    if (exists) { skipped++; continue; }

    if (options.dryRun) {
      imported++;
      if (imported <= 3) {
        console.log(`  [DRY] ${row.variantId}: ${row.title.slice(0, 80)} | ${row.brand} | ${row.price} ₸`);
      }
      continue;
    }

    try {
      const brandId = await getOrCreateBrand(row.brand);
      const catSlug = mapCategory(row.categoryPath);
      const catId = catSlug ? KZ_CATEGORIES[catSlug] : null;

      await prisma.product.create({
        data: {
          variantId: row.variantId,
          title: row.title,
          description: row.description || undefined,
          brandId,
          price: row.price,
          imageUrl: row.imageUrl || undefined,
          mpn: row.mpn || undefined,
          attributes: row.attributes,
          availability: 'in_stock',
          categories: catId
            ? { create: [{ categoryId: catId }] }
            : undefined,
          stock: {
            create: WAREHOUSE_IDS.map(whId => ({
              warehouseId: whId,
              quantity: Math.floor(Math.random() * 500),
              reserved: 0,
              reorderPoint: 10,
            })),
          },
        },
      });

      imported++;
      if (imported % 100 === 0) {
        console.log(`  Progress: ${imported} imported, ${skipped} skipped...`);
      }
    } catch (e: any) {
      errors++;
      if (errors <= 5) console.error(`  Error on ${row.variantId}: ${e.message}`);
    }
  }

  console.log(`\nImport complete:`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped (exists): ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

// ── Main ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  const fileArg = args.find(a => a.endsWith('.csv'));

  const filePath = fileArg || path.join(
    process.env.USERPROFILE || 'C:\\Users\\user',
    'Downloads', 'grainger_data_2022_01.csv'
  );

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log('Usage: npx tsx scripts/import-grainger-csv.ts [file.csv] [--dry-run] [--limit=N]');
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Synteco Grainger CSV Importer v2       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await importCsv(filePath, { dryRun, limit });

  await prisma.$disconnect();
  console.log('\nDone.');
}

main().catch(console.error);
