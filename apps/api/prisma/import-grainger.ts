// Quick import from Grainger.json — fills all categories with products
// Run: docker exec synteco-api pnpm tsx prisma/import-grainger.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { classifyCatalogCategory } from '../scripts/catalog-taxonomy';

const prisma = new PrismaClient();

interface GraingerProduct {
  variant_id: string;
  item_id?: string;
  title: string;
  description?: string;
  product_category?: string;
  brand?: string;
  image_url?: string;
  price?: string;
  availability?: string;
  mpn?: string;
  variant_attributes?: { name: string; value: string }[];
  group_id?: string;
}

async function main() {
  console.log('📦 Importing products from Grainger.json...\n');

  const filePath = '/app/apps/api/prisma/../../data/Grainger.json';
  // In production Docker, the data is at the repo root
  const dataPaths = [
    '/tmp/Grainger.json',
    '/opt/synteco/data/Grainger.json',
    path.resolve(__dirname, '../../../data/Grainger.json'),
  ];

  let raw = '';
  for (const p of dataPaths) {
    try { raw = fs.readFileSync(p, 'utf-8'); console.log(`  Found data at: ${p}`); break; }
    catch {}
  }

  if (!raw) {
    console.error('❌ Grainger.json not found. Skipping import.');
    return;
  }

  const allProducts: GraingerProduct[] = JSON.parse(raw);
  console.log(`  Total products in file: ${allProducts.length}`);

  // Get existing categories and brands from DB
  const existingCats = await prisma.category.findMany();
  const catMap = new Map(existingCats.map(c => [c.slug, c.id]));

  const existingBrands = await prisma.brand.findMany();
  const brandMap = new Map(existingBrands.map(b => [b.slug, b.id]));
  const brandIdMap = new Map(existingBrands.map(b => [b.name, b.id]));

  // Find products per category (target: 5 per category)
  const targetPerCat = 100;
  const catCount: Record<string, number> = {};
  const selected: GraingerProduct[] = [];

  for (const p of allProducts) {
    if (!p.variant_id || !p.title || !p.price) continue;
    const catSlug = classifyCatalogCategory(p)?.slug ?? null;
    if (!catSlug || !catMap.has(catSlug)) continue;
    const count = catCount[catSlug] ?? 0;
    if (count >= targetPerCat) continue;
    catCount[catSlug] = count + 1;
    selected.push(p);
    if (Object.keys(catCount).length >= 14 && Object.values(catCount).every(c => c >= targetPerCat)) break;
  }

  console.log(`  Selected ${selected.length} products across ${Object.keys(catCount).length} categories`);

  // Get warehouses
  const warehouses = await prisma.warehouse.findMany();

  let imported = 0;
  for (const p of selected) {
    try {
      const catSlug = classifyCatalogCategory(p)!.slug;
      const catId = catMap.get(catSlug)!;

      // Parse price: "$15.60" -> 1560 KZT (rough conversion)
      const priceStr = (p.price ?? '$10').replace(/[$,]/g, '');
      const priceUSD = parseFloat(priceStr) || 10;
      const priceKZT = Math.round(priceUSD * 470); // USD -> KZT

      // Create or find brand
      const brandName = p.brand ?? 'Generic';
      let brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let brandId = brandMap.get(brandSlug);

      if (!brandId) {
        const existing = brandIdMap.get(brandName);
        if (existing) {
          brandId = existing;
          brandMap.set(brandSlug, brandId);
        } else {
          const created = await prisma.brand.upsert({
            where: { slug: brandSlug },
            update: {},
            create: { name: brandName, slug: brandSlug },
          });
          brandId = created.id;
          brandMap.set(brandSlug, brandId);
          brandIdMap.set(brandName, brandId);
        }
      }

      // Attributes
      const attributes: Record<string, string> = {};
      if (p.variant_attributes) {
        for (const attr of p.variant_attributes.slice(0, 8)) {
          attributes[attr.name] = attr.value;
        }
      }

      // Create product
      const product = await prisma.product.upsert({
        where: { variantId: p.variant_id },
        update: {},
        create: {
          variantId: p.variant_id,
          title: p.title.substring(0, 500),
          description: (p.description ?? '').substring(0, 2000),
          brandId,
          imageUrl: p.image_url ?? '',
          price: priceKZT,
          availability: 'in_stock',
          mpn: p.variant_id,
          attributes,
        },
      });

      // Link to category
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: catId } },
        update: {},
        create: { productId: product.id, categoryId: catId },
      });

      // Stock
      for (const wh of warehouses) {
        const qty = Math.floor(Math.random() * 100) + 5;
        await prisma.productStock.upsert({
          where: { productId_warehouseId: { productId: product.id, warehouseId: wh.id } },
          update: { quantity: qty },
          create: { productId: product.id, warehouseId: wh.id, quantity: qty },
        });
      }

      // Price
      await prisma.productPrice.upsert({
        where: { productId_tier_minQuantity: { productId: product.id, tier: 'retail', minQuantity: 1 } },
        update: { price: priceKZT },
        create: { productId: product.id, tier: 'retail', price: priceKZT, minQuantity: 1 },
      });

      imported++;
      if (imported % 5 === 0) console.log(`  ... ${imported}/${selected.length}`);
    } catch (err: any) {
      console.error(`  ⚠️ Failed ${p.variant_id}: ${err.message}`);
    }
  }

  console.log(`\n✅ Imported ${imported} products`);
  const total = await prisma.product.count();
  console.log(`   Total products in DB: ${total}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
