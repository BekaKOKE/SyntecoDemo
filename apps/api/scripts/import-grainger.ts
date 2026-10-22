/**
 * Grainger Product Import Script
 *
 * Reads data/Grainger.json, maps categories, creates/finds brands,
 * and bulk-inserts products into the Synteco PostgreSQL database.
 *
 * Usage:  npx tsx apps/api/scripts/import-grainger.ts [--limit N] [--dry-run]
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { classifyCatalogCategory } from './catalog-taxonomy';

// ── Types ──────────────────────────────────────────────

interface GraingerProduct {
  url: string;
  item_id: string;
  variant_id: string;
  title: string;
  description: string;
  product_category: string;
  category_tree: { name: string; url: string }[];
  brand: string;
  image_url: string;
  price: string; // "$15.60" format
  sale_price: string | null;
  availability: string;
  availability_date: string | null;
  group_id: string;
  listing_has_variations: boolean;
  variant_attributes: { name: string; value: string }[];
  variants: any[];
  store_name: string;
  mpn?: string;
}

interface ImportStats {
  total: number;
  inserted: number;
  skipped: number;
  failed: number;
  brandsCreated: number;
  brandsFound: number;
  categoryMapped: number;
  categoryFallback: number;
  categoryUnmapped: number;
  errors: string[];
}

// ── Constants ──────────────────────────────────────────

const KZT_PER_USD = 460;
const WAREHOUSE_IDS = [
  'b0000001-0000-0000-0000-000000000001', // Алматы
  'b0000001-0000-0000-0000-000000000002', // Астана
  'b0000001-0000-0000-0000-000000000003', // Шымкент
  'b0000001-0000-0000-0000-000000000004', // Атырау
];
const BATCH_SIZE = 100;

// ── CLI Args ───────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = ((): number => {
  const idx = args.indexOf('--limit');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : Infinity;
})();
const FILE_ARG = ((): string | null => {
  const idx = args.indexOf('--file');
  return idx !== -1 ? args[idx + 1] : null;
})();

// ── Helpers ────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 255);
}

function parsePrice(priceStr: string | null): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parsePriceKZT(priceStr: string | null): number {
  return Math.round(parsePrice(priceStr) * KZT_PER_USD);
}

function normalizeAvailability(avail: string): string {
  if (!avail) return 'in_stock';
  const a = avail.toLowerCase();
  if (a.includes('in_stock')) return 'in_stock';
  if (a.includes('out_of_stock')) return 'out_of_stock';
  if (a.includes('discontinued')) return 'discontinued';
  return 'in_stock';
}

/**
 * Extract a category slug from a Grainger product's category_tree.
 * The tree is: ["Product Categories", "TopLevel", "SubCat", "Leaf"]
 * We map index 1 (first real category) through our lookup table.
 * Falls back to index 2 if index 1 has no match.
 */
function resolveCategory(product: Pick<GraingerProduct, 'product_category' | 'category_tree'>): {
  slug: string | null;
  method: 'mapped' | 'unmapped';
} {
  const result = classifyCatalogCategory(product);
  return result ? { slug: result.slug, method: 'mapped' } : { slug: null, method: 'unmapped' };
}

// ── Main Import Logic ──────────────────────────────────

async function main() {
  const prisma = new PrismaClient();
  // Resolve from script dir: scripts → api → apps → root → data
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const jsonPath = FILE_ARG
    ? path.resolve(FILE_ARG)
    : path.join(projectRoot, 'data', 'Grainger.json');

  console.log('═'.repeat(60));
  console.log('  Synteco — Grainger Product Import');
  console.log('═'.repeat(60));
  console.log(`  Data file:  ${jsonPath}`);
  console.log(`  Limit:      ${LIMIT === Infinity ? 'ALL' : LIMIT}`);
  console.log(`  Dry run:    ${DRY_RUN}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Rate:       ${KZT_PER_USD} KZT/USD`);
  console.log('─'.repeat(60));

  // ── 1. Load reference data ──────────────────────────

  console.log('\n📦 Loading reference data from DB...');

  const [dbCategories, dbBrands, dbWarehouses] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.brand.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.warehouse.findMany({ select: { id: true, code: true } }),
  ]);

  const catBySlug = new Map(dbCategories.map(c => [c.slug, c.id]));
  const brandByName = new Map(dbBrands.map(b => [b.name.toLowerCase(), b]));
  const warehouseIds = dbWarehouses.map(w => w.id);

  // Pre-load existing variant_ids to skip already-imported products
  const existingVariants = new Set(
    (await prisma.product.findMany({ select: { variantId: true } })).map(p => p.variantId)
  );

  console.log(`   Categories:    ${dbCategories.length} loaded`);
  console.log(`   Brands:        ${dbBrands.length} loaded`);
  console.log(`   Warehouses:    ${warehouseIds.length} loaded`);
  console.log(`   Existing SKUs: ${existingVariants.size} in DB`);

  // ── 2. Read Grainger JSON ────────────────────────────

  console.log('\n📖 Reading Grainger data...');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const products: GraingerProduct[] = JSON.parse(raw);
  console.log(`   ${products.length.toLocaleString()} products in file`);

  const toImport = LIMIT === Infinity ? products : products.slice(0, LIMIT);
  console.log(`   ${toImport.length.toLocaleString()} products to import`);

  // ── 3. Import loop ───────────────────────────────────

  const stats: ImportStats = {
    total: toImport.length,
    inserted: 0,
    skipped: 0,
    failed: 0,
    brandsCreated: 0,
    brandsFound: 0,
    categoryMapped: 0,
    categoryFallback: 0,
    categoryUnmapped: 0,
    errors: [],
  };

  const startTime = Date.now();
  let batch: any[] = [];

  async function flushBatch() {
    if (batch.length === 0) return;

    if (!DRY_RUN) {
      try {
        await prisma.$transaction([
          prisma.product.createMany({ data: batch.map(b => b.product), skipDuplicates: true }),
          prisma.productCategory.createMany({ data: batch.flatMap(b => b.categories), skipDuplicates: true }),
          prisma.productPrice.createMany({ data: batch.map(b => b.price), skipDuplicates: true }),
          prisma.productStock.createMany({ data: batch.flatMap(b => b.stock), skipDuplicates: true }),
        ]);
      } catch (err: any) {
        console.error(`   ❌ Batch insert failed: ${err.message}`);
        stats.errors.push(`Batch insert: ${err.message}`);
        stats.failed += batch.length;
      }
    }

    stats.inserted += batch.length;
    batch = [];
  }

  for (let i = 0; i < toImport.length; i++) {
    const p = toImport[i];

    try {
      // --- Skip already-imported products ---
      if (existingVariants.has(p.variant_id)) {
        stats.skipped++;
        continue;
      }

      // --- Category resolution ---
      const catResult = resolveCategory(p);
      if (catResult.method === 'mapped') stats.categoryMapped++;
      else stats.categoryUnmapped++;

      const categoryId = catResult.slug ? catBySlug.get(catResult.slug) : null;

      // Skip products that can't be categorized (for now)
      if (!categoryId) {
        stats.skipped++;
        continue;
      }

      // --- Brand resolution: find or create ---
      const brandName = (p.brand ?? '').trim();
      let brandId: string;

      if (!brandName) {
        stats.skipped++;
        continue;
      }

      const existingBrand = brandByName.get(brandName.toLowerCase());
      if (existingBrand) {
        brandId = existingBrand.id;
        stats.brandsFound++;
      } else if (DRY_RUN) {
        brandId = uuid();
        stats.brandsCreated++;
      } else {
        // Create brand
        try {
          const newBrand = await prisma.brand.create({
            data: {
              name: brandName,
              slug: slugify(brandName) + '-' + uuid().substring(0, 6),
            },
          });
          brandId = newBrand.id;
          brandByName.set(brandName.toLowerCase(), newBrand);
          stats.brandsCreated++;
        } catch (createErr: any) {
          // Race: another product in the batch already created this brand
          // Retry find
          const retry = await prisma.brand.findFirst({ where: { name: brandName } });
          if (retry) {
            brandId = retry.id;
            brandByName.set(brandName.toLowerCase(), retry);
            stats.brandsFound++;
          } else {
            stats.failed++;
            stats.errors.push(`Brand creation failed for "${brandName}": ${createErr.message}`);
            continue;
          }
        }
      }

      // --- Product data ---
      const productId = uuid();
      const priceKZT = parsePriceKZT(p.price);
      const priceUSD = parsePrice(p.price);
      const attributes: Record<string, string> = {};
      if (p.variant_attributes) {
        for (const attr of p.variant_attributes) {
          attributes[attr.name] = attr.value;
        }
      }

      const productRow = {
        id: productId,
        variantId: p.variant_id,
        itemId: p.item_id === '0' ? null : p.item_id,
        title: p.title.substring(0, 500),
        description: p.description?.substring(0, 5000) ?? null,
        brandId,
        price: priceKZT,
        imageUrl: p.image_url?.substring(0, 1000) ?? null,
        availability: normalizeAvailability(p.availability),
        groupId: p.group_id === '0' ? null : p.group_id,
        hasVariations: p.listing_has_variations,
        mpn: p.mpn?.substring(0, 100) ?? null,
        attributes: attributes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // --- Category link ---
      const categoryLink = { productId, categoryId };

      // --- Retail price ---
      const priceRow = {
        id: uuid(),
        productId,
        tier: 'retail',
        price: priceKZT,
        minQuantity: 1,
        createdAt: new Date(),
      };

      // --- Stock rows (randomized per warehouse) ---
      const stockRows = warehouseIds.map(wid => ({
        productId,
        warehouseId: wid,
        quantity: Math.floor(Math.random() * 500) + 1,
        reserved: 0,
        reorderPoint: 10,
        updatedAt: new Date(),
      }));

      batch.push({
        product: productRow,
        categories: [categoryLink],
        price: priceRow,
        stock: stockRows,
      });

      // --- Progress reporting ---
      if ((i + 1) % BATCH_SIZE === 0) {
        await flushBatch();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = Math.round((i + 1) / parseFloat(elapsed));
        console.log(`   [${i + 1}/${toImport.length}] ${stats.inserted} inserted, ${stats.skipped} skipped, ${stats.failed} failed — ${rate} prod/s — ${elapsed}s`);
      }
    } catch (err: any) {
      stats.failed++;
      stats.errors.push(`Row ${i} (${p.variant_id}): ${err.message}`);
    }
  }

  // Final flush
  await flushBatch();

  // ── 4. Report ────────────────────────────────────────

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '═'.repeat(60));
  console.log('  IMPORT COMPLETE');
  console.log('═'.repeat(60));
  console.log(`  Total in file:   ${products.length.toLocaleString()}`);
  console.log(`  Processed:       ${toImport.length.toLocaleString()}`);
  console.log(`  ✅ Inserted:     ${stats.inserted}`);
  console.log(`  ⏭️  Skipped:      ${stats.skipped} (no category or brand)`);
  console.log(`  ❌ Failed:       ${stats.failed}`);
  console.log(`  🏷️  Cat mapped:   ${stats.categoryMapped}`);
  console.log(`  🔍 Cat fallback:  ${stats.categoryFallback}`);
  console.log(`  ⚠️  Cat unmapped:  ${stats.categoryUnmapped}`);
  console.log(`  🏭 Brands found:  ${stats.brandsFound}`);
  console.log(`  🆕 Brands created: ${stats.brandsCreated}`);
  console.log(`  ⏱️  Time:          ${elapsed}s`);
  if (DRY_RUN) {
    console.log('\n  ⚠️  DRY RUN — no data was written to the database.');
  }
  if (stats.errors.length > 0) {
    console.log(`\n  First 10 errors:`);
    for (const e of stats.errors.slice(0, 10)) {
      console.log(`    - ${e}`);
    }
  }
  console.log('═'.repeat(60));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal import error:', err);
  process.exit(1);
});
