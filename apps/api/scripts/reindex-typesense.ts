/**
 * One-shot script: index all products into Typesense.
 * Run: npx tsx scripts/reindex-typesense.ts
 */
import { PrismaClient } from '@prisma/client';
import { Client } from 'typesense';

const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT || '8108', 10);
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'synteco_dev_key';
const COLLECTION = 'products';

async function main() {
  const prisma = new PrismaClient();
  const typesense = new Client({
    nodes: [{ host: TYPESENSE_HOST, port: TYPESENSE_PORT, protocol: 'http' }],
    apiKey: TYPESENSE_API_KEY,
  });

  console.log('Fetching products from database...');
  const products = await prisma.product.findMany({
    include: {
      brand: { select: { name: true } },
      categories: { include: { category: { select: { name: true } } } },
      stock: { select: { quantity: true, reserved: true } },
    },
  });

  console.log(`Indexing ${products.length} products into Typesense...`);

  const docs = products.map(p => {
    const stockTotal = (p.stock ?? []).reduce(
      (sum: number, s: any) => sum + Number(s.quantity) - Number(s.reserved), 0,
    );
    return {
      id: p.id,
      variantId: p.variantId,
      title: p.title,
      description: (p.description ?? '').substring(0, 2000),
      brandName: p.brand?.name ?? '',
      categoryNames: (p.categories ?? []).map((pc: any) => pc.category?.name).filter(Boolean),
      price: Number(p.price),
      availability: p.availability,
      imageUrl: p.imageUrl ?? '',
      mpn: p.mpn ?? '',
      stockTotal,
    };
  });

  try {
    const result = await typesense
      .collections(COLLECTION)
      .documents()
      .import(docs, { action: 'upsert' });

    const errors = (result as any[]).filter((r: any) => !r.success);
    if (errors.length > 0) {
      console.error(`  ${errors.length} import errors:`, errors.slice(0, 3));
    }

    console.log(`Done! Indexed ${docs.length - errors.length}/${docs.length} products.`);
  } catch (err: any) {
    console.error('Import failed:', err.message);
  }

  await prisma.$disconnect();
}

main();
