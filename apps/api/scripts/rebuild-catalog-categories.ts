import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { CATALOG_ROOT_SLUGS, classifyCatalogCategory, type SourceCategoryInput } from './catalog-taxonomy';
import { CURATED_ASSIGNMENTS } from './catalog-curated-assignments';

interface SourceProduct extends SourceCategoryInput {
  variant_id?: string;
  title?: string;
}

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

function loadSourceProducts(): Map<string, SourceProduct> {
  const root = path.resolve(__dirname, '..', '..', '..');
  const files = ['Grainger.json', 'Grainger_batch2.json'];
  const products = new Map<string, SourceProduct>();

  for (const file of files) {
    const filePath = path.join(root, 'data', file);
    if (!fs.existsSync(filePath)) continue;
    const rows = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SourceProduct[];
    for (const row of rows) {
      if (row.variant_id) products.set(row.variant_id, row);
    }
  }
  return products;
}

async function main() {
  const sourceByVariant = loadSourceProducts();
  const categories = await prisma.category.findMany({ select: { id: true, slug: true, path: true, level: true } });
  const categoryBySlug = new Map(categories.map(category => [category.slug, category]));
  const catalogCategoryIds = categories
    .filter(category => CATALOG_ROOT_SLUGS.some(root => category.path === root || category.path.startsWith(`${root}.`)))
    .map(category => category.id);

  const products = await prisma.product.findMany({
    select: {
      id: true,
      variantId: true,
      title: true,
      categories: { select: { categoryId: true, category: { select: { slug: true } } } },
    },
  });

  const assignments: Array<{ productId: string; categoryId: string; slug: string }> = [];
  const unmapped: Array<{ variantId: string; title: string; sourcePath: string }> = [];
  const withoutSourceProducts: Array<{ variantId: string; title: string; categories: string[] }> = [];
  let withoutSource = 0;

  for (const product of products) {
    if (Object.prototype.hasOwnProperty.call(CURATED_ASSIGNMENTS, product.variantId)) {
      const slug = CURATED_ASSIGNMENTS[product.variantId];
      if (slug) {
        const category = categoryBySlug.get(slug);
        if (!category) throw new Error(`Curated category slug not found in DB: ${slug}`);
        assignments.push({ productId: product.id, categoryId: category.id, slug });
      }
      continue;
    }

    const source = sourceByVariant.get(product.variantId);
    if (!source) {
      withoutSource += 1;
      withoutSourceProducts.push({
        variantId: product.variantId,
        title: product.title,
        categories: product.categories.map(item => item.category.slug),
      });
      continue;
    }

    const classification = classifyCatalogCategory(source);
    if (!classification) {
      const rawPath = source.product_category
        ?? source.category_tree?.map(item => item.name).filter(Boolean).join(' > ')
        ?? '';
      unmapped.push({ variantId: product.variantId, title: product.title, sourcePath: rawPath });
      continue;
    }

    const category = categoryBySlug.get(classification.slug);
    if (!category) throw new Error(`Category slug not found in DB: ${classification.slug}`);
    assignments.push({ productId: product.id, categoryId: category.id, slug: classification.slug });
  }

  const bySlug = new Map<string, number>();
  for (const assignment of assignments) bySlug.set(assignment.slug, (bySlug.get(assignment.slug) ?? 0) + 1);
  const intentionallyExcluded = products.filter(product => CURATED_ASSIGNMENTS[product.variantId] === null).length;
  const assignedProductIds = new Set(assignments.map(item => item.productId));
  const rootAssignments = assignments.filter(item => categoryBySlug.get(item.slug)?.level === 1);

  console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`DB products: ${products.length}`);
  console.log(`Matched source products: ${products.length - withoutSource}`);
  console.log(`Strict assignments: ${assignments.length}`);
  console.log(`Unmapped source products: ${unmapped.length}`);
  console.log(`Products without source record (preserved): ${withoutSource}`);
  console.log(`Intentionally excluded products: ${intentionallyExcluded}`);
  if (withoutSourceProducts.length > 0) {
    console.log('\nPreserved products without source record:');
    for (const product of withoutSourceProducts) {
      console.log(`  ${product.variantId}: ${product.title} [${product.categories.join(', ')}]`);
    }
  }
  console.log('\nAssignments by leaf:');
  for (const [slug, count] of [...bySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${slug}: ${count}`);
  }
  console.log('\nUnmapped by source top level:');
  const unmappedGroups = new Map<string, number>();
  for (const item of unmapped) {
    const top = item.sourcePath.split(/\s*>\s*|\/+\s*/)[1] || '<missing>';
    unmappedGroups.set(top, (unmappedGroups.get(top) ?? 0) + 1);
  }
  for (const [name, count] of [...unmappedGroups.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${name}: ${count}`);

  if (unmapped.length > 0 || withoutSource > 0) {
    throw new Error(`Classification incomplete: ${unmapped.length} unmapped source products, ${withoutSource} products without source`);
  }
  if (assignedProductIds.size !== assignments.length) {
    throw new Error(`Classification produced duplicate assignments: ${assignments.length} rows for ${assignedProductIds.size} products`);
  }
  if (rootAssignments.length > 0) {
    throw new Error(`Classification assigned ${rootAssignments.length} products to root categories instead of leaf categories`);
  }
  if (assignments.length !== products.length - intentionallyExcluded) {
    throw new Error(`Classification coverage failed: ${assignments.length} assignments for ${products.length - intentionallyExcluded} expected products`);
  }

  if (!apply) {
    console.log('\nNo database changes made. Re-run with --apply after reviewing this report.');
    return;
  }

  const managedProductIds = products
    .filter(product => sourceByVariant.has(product.variantId)
      || Object.prototype.hasOwnProperty.call(CURATED_ASSIGNMENTS, product.variantId))
    .map(product => product.id);

  await prisma.$transaction(async tx => {
    await tx.productCategory.deleteMany({
      where: {
        productId: { in: managedProductIds },
        categoryId: { in: catalogCategoryIds },
      },
    });
    if (assignments.length > 0) {
      await tx.productCategory.createMany({
        data: assignments.map(({ productId, categoryId }) => ({ productId, categoryId })),
        skipDuplicates: true,
      });
    }

    for (const category of categories.filter(item => catalogCategoryIds.includes(item.id))) {
      const rows = await tx.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(DISTINCT pc.product_id)::bigint AS count
        FROM "product"."product_categories" pc
        JOIN "product"."categories" c ON c.id = pc.category_id
        JOIN "product"."products" p ON p.id = pc.product_id
        WHERE (c.path::text = ${category.path} OR c.path::text LIKE ${`${category.path}.%`})
          AND p.availability <> 'discontinued'
      `);
      await tx.category.update({
        where: { id: category.id },
        data: { productCount: Number(rows[0]?.count ?? 0n) },
      });
    }
  }, { timeout: 60_000 });

  const rebuiltLinks = await prisma.productCategory.findMany({
    where: {
      productId: { in: managedProductIds },
      categoryId: { in: catalogCategoryIds },
    },
    select: { productId: true, categoryId: true },
  });
  const expectedByProduct = new Map(assignments.map(item => [item.productId, item.categoryId]));
  const actualByProduct = new Map<string, string[]>();
  for (const link of rebuiltLinks) {
    const links = actualByProduct.get(link.productId) ?? [];
    links.push(link.categoryId);
    actualByProduct.set(link.productId, links);
  }
  const invalidProducts = managedProductIds.filter(productId => {
    const expected = expectedByProduct.get(productId);
    const actual = actualByProduct.get(productId) ?? [];
    return expected ? actual.length !== 1 || actual[0] !== expected : actual.length !== 0;
  });
  if (invalidProducts.length > 0) {
    throw new Error(`Post-rebuild invariant failed for ${invalidProducts.length} products`);
  }

  console.log(`\nCatalog category links rebuilt successfully. Verified ${managedProductIds.length} managed products.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
