/**
 * Quick import for Grainger_batch2.json — handles the different JSON format.
 * Usage: npx tsx scripts/import-batch2.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { classifyCatalogCategory } from './catalog-taxonomy';

const prisma = new PrismaClient();

const WAREHOUSE_IDS = [
  'b0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000003',
  'b0000001-0000-0000-0000-000000000004',
];

const brandCache = new Map<string, string>();

async function getOrCreateBrand(name: string): Promise<string> {
  const key = name.trim();
  if (!key) return '';
  if (brandCache.has(key)) return brandCache.get(key)!;

  let brand = await prisma.brand.findUnique({ where: { name: key } });
  if (!brand) {
    const slug = key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).slice(2, 8);
    brand = await prisma.brand.create({ data: { name: key, slug } });
  }
  brandCache.set(key, brand.id);
  return brand.id;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jsonPath = path.join(process.cwd(), '..', '..', 'data', 'Grainger_batch2.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryBySlug = new Map(categories.map(category => [category.slug, category.id]));
  console.log(`Products in file: ${data.length}`);
  if (dryRun) console.log('DRY RUN\n');

  let imported = 0, skipped = 0, noCat = 0;

  for (const p of data) {
    const exists = await prisma.product.findUnique({ where: { variantId: p.variant_id } });
    if (exists) { skipped++; continue; }

    const catSlug = classifyCatalogCategory(p)?.slug ?? null;
    if (!catSlug) { noCat++; continue; }
    const catId = categoryBySlug.get(catSlug);
    if (!catId) continue;

    const brandId = await getOrCreateBrand(p.brand || 'Unknown');
    if (!brandId) continue;

    if (dryRun) {
      imported++;
      if (imported <= 3) console.log(`  [DRY] ${p.variant_id}: ${(p.title || '').slice(0, 70)} | ${p.brand} | → ${catSlug}`);
      continue;
    }

    try {
      const attrs: Record<string, string> = {};
      if (p.variant_attributes) {
        for (const a of p.variant_attributes) {
          if (a.name && a.value) attrs[a.name] = a.value;
        }
      }

      const priceKZT = Math.round((p.price || 0) * 460) || 1000;

      await prisma.product.create({
        data: {
          variantId: p.variant_id,
          title: (p.title || '').slice(0, 500),
          description: (p.description || '').slice(0, 5000) || undefined,
          brandId,
          price: priceKZT,
          imageUrl: p.image_url || undefined,
          mpn: undefined,
          attributes: attrs,
          availability: 'in_stock',
          categories: { create: [{ categoryId: catId }] },
          stock: {
            create: WAREHOUSE_IDS.map(whId => ({
              warehouseId: whId,
              quantity: Math.floor(Math.random() * 300),
              reserved: 0,
              reorderPoint: 10,
            })),
          },
        },
      });
      imported++;
      if (imported % 50 === 0) console.log(`  Progress: ${imported} imported...`);
    } catch (e: any) {
      console.error(`  Error ${p.variant_id}: ${e.message?.slice(0, 100)}`);
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} already exist, ${noCat} no category`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
