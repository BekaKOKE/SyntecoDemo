/**
 * Seed flagship products for the 6 official distributor brands.
 *
 * Run: pnpm --filter @synteco/api exec tsx prisma/seed-brands.ts
 *
 * Idempotent — uses upsert by slug/variantId, safe to re-run.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding brand flagship products...\n');

  // ── Brands (upsert by slug) ──
  const honeywell = await prisma.brand.upsert({
    where: { slug: 'honeywell' },
    update: {},
    create: { name: 'Honeywell', slug: 'honeywell', website: 'https://honeywell.com' },
  });
  const threeM = await prisma.brand.upsert({
    where: { slug: '3m' },
    update: {},
    create: { name: '3M', slug: '3m', website: 'https://3m.com' },
  });
  const pip = await prisma.brand.upsert({
    where: { slug: 'pip' },
    update: {},
    create: { name: 'PIP Global', slug: 'pip', website: 'https://pipglobal.com' },
  });
  const masterLock = await prisma.brand.upsert({
    where: { slug: 'master-lock' },
    update: {},
    create: { name: 'Master Lock', slug: 'master-lock', website: 'https://masterlock.com' },
  });
  const ansul = await prisma.brand.upsert({
    where: { slug: 'ansul' },
    update: {},
    create: { name: 'Ansul', slug: 'ansul', website: 'https://ansul.com' },
  });
  const uvex = await prisma.brand.upsert({
    where: { slug: 'uvex' },
    update: {},
    create: { name: 'Uvex', slug: 'uvex', website: 'https://uvex.com' },
  });

  // ── Categories (upsert by slug) ──
  // 'siz' already exists in DB; others may need creation.
  const catSiz = await prisma.category.upsert({
    where: { slug: 'siz' },
    update: {},
    create: { name: 'СИЗ', slug: 'siz', path: 'bezopasnost.siz', level: 2 },
  });
  const catResp = await prisma.category.upsert({
    where: { slug: 'respirators' },
    update: {},
    create: { name: 'Респираторы', slug: 'respirators', path: 'bezopasnost.respirators', level: 2 },
  });
  const catFire = await prisma.category.upsert({
    where: { slug: 'fire-extinguishers' },
    update: {},
    create: {
      name: 'Огнетушители',
      slug: 'fire-extinguishers',
      path: 'bezopasnost.fire-extinguishers',
      level: 2,
    },
  });
  const catLocks = await prisma.category.upsert({
    where: { slug: 'loto-locks' },
    update: {},
    create: {
      name: 'Замки LOTO',
      slug: 'loto-locks',
      path: 'bezopasnost.loto-locks',
      level: 2,
    },
  });

  // ── Product definitions ──
  interface ProductSeed {
    brandId: string;
    variantId: string;
    title: string;
    description: string;
    price: number;
    mpn?: string;
    attributes: Record<string, string>;
    categoryIds: string[];
    imageUrl?: string;
  }

  const products: ProductSeed[] = [
    // ── Honeywell (1) ──
    {
      brandId: honeywell.id,
      variantId: 'HW-NORTH-7700-M',
      title: 'Респиратор Honeywell North 7700 (полумаска, силикон, M)',
      description:
        'Силиконовая полумаска Honeywell North 7700. Совместима с фильтрами Honeywell North серии P. Четырёхточечное крепление. Размер M.',
      price: 24500,
      mpn: '770030-M',
      attributes: { Тип: 'Полумаска', Материал: 'Силикон', Размер: 'M', Стандарт: 'NIOSH' },
      categoryIds: [catResp.id],
    },
    // ── 3M (2) ──
    {
      brandId: threeM.id,
      variantId: '3M-6200',
      title: 'Респиратор 3M 6200 (полумаска, габаритовый, M)',
      description:
        'Полумаска 3M серии 6000. Совместима с фильтрами 3M серий 2000, 6000, 2091. Размер M.',
      price: 18900,
      mpn: '6200',
      attributes: {
        Тип: 'Полумаска',
        Размер: 'M',
        Стандарт: 'NIOSH',
        'Класс защиты': 'FFP3',
      },
      categoryIds: [catResp.id],
    },
    {
      brandId: threeM.id,
      variantId: '3M-E-A-R-312-1250',
      title: 'Беруши 3M E-A-R 312-1250 (одноразовые, 200 пар)',
      description:
        'Одноразовые пенополиуретановые беруши 3M E-A-R. NRR 32 дБ. Упаковка 200 пар.',
      price: 8900,
      mpn: '312-1250',
      attributes: { Тип: 'Беруши', NRR: '32 дБ', Количество: '200 пар' },
      categoryIds: [catSiz.id],
    },
    // ── PIP Global (1) ──
    {
      brandId: pip.id,
      variantId: 'PIP-32-375-L',
      title: 'Перчатки PIP Nitripor 32-375 (нитриловые, L)',
      description:
        'Нитриловые перчатки PIP для универсального применения. Уровень защиты EN 388 level 3. Размер L.',
      price: 650,
      mpn: '32-375-L',
      attributes: {
        Тип: 'Перчатки',
        Материал: 'Нитрил',
        Размер: 'L',
        Стандарт: 'EN 388',
        'Уровень защиты': 'Level 3',
      },
      categoryIds: [catSiz.id],
    },
    // ── Master Lock (1) ──
    {
      brandId: masterLock.id,
      variantId: 'ML-411-RED',
      title: 'Замок LOTO Master Lock 411 (нейлоновый, красный)',
      description:
        'Нейлоновый замок для lockout/tagout Master Lock 411. Корпус 45 мм, дужка из стали. Цвет красный.',
      price: 3200,
      mpn: '411RED',
      attributes: {
        Тип: 'Замок LOTO',
        Материал: 'Нейлон',
        Цвет: 'Красный',
        'Размер корпуса': '45 мм',
      },
      categoryIds: [catLocks.id],
    },
    // ── Ansul (1) ──
    {
      brandId: ansul.id,
      variantId: 'ANSUL-KD2-6LP',
      title: 'Огнетушитель Ansul KD2-6LP (порошковый, 6 кг, ABC)',
      description:
        'Порошковый огнетушитель Ansul KD2-6LP класса ABC. Масса заряда 6 кг. Корпус стальной. UL-рейтинг 2A:10B:C.',
      price: 28900,
      mpn: 'KD2-6LP',
      attributes: {
        Тип: 'Порошковый',
        'Масса заряда': '6 кг',
        'Класс пожара': 'A, B, C',
        Стандарт: 'UL',
      },
      categoryIds: [catFire.id],
    },
    // ── Uvex (1) ──
    {
      brandId: uvex.id,
      variantId: 'UVEX-9192-215',
      title: 'Очки Uvex Stealth OTG 9192 (поверх очков, прозрачные)',
      description:
        'Защитные очки Uvex Stealth OTG, надеваются поверх корригирующих. Линза polycarbonate с anti-fog/anti-scratch. EN 166.',
      price: 7800,
      mpn: '9192.215',
      attributes: {
        Тип: 'Очки',
        Линза: 'Прозрачная',
        Покрытие: 'anti-fog, anti-scratch',
        Стандарт: 'EN 166',
      },
      categoryIds: [catSiz.id],
    },
  ];

  // ── Insert products (upsert by variantId) ──
  for (const p of products) {
    // Delete existing product-category links (if updating) so we can re-create them cleanly
    const existing = await prisma.product.findUnique({
      where: { variantId: p.variantId },
      select: { id: true },
    });
    if (existing) {
      await prisma.productCategory.deleteMany({ where: { productId: existing.id } });
    }

    const created = await prisma.product.upsert({
      where: { variantId: p.variantId },
      update: {
        title: p.title,
        description: p.description,
        brandId: p.brandId,
        price: p.price,
        mpn: p.mpn,
        imageUrl: p.imageUrl,
        availability: 'in_stock',
        attributes: p.attributes,
      },
      create: {
        variantId: p.variantId,
        title: p.title,
        description: p.description,
        brandId: p.brandId,
        price: p.price,
        mpn: p.mpn,
        imageUrl: p.imageUrl,
        availability: 'in_stock',
        attributes: p.attributes,
      },
    });

    // Re-link categories
    await prisma.productCategory.createMany({
      data: p.categoryIds.map((categoryId) => ({ productId: created.id, categoryId })),
      skipDuplicates: true,
    });

    // Upsert retail price
    await prisma.productPrice.upsert({
      where: {
        productId_tier_minQuantity: {
          productId: created.id,
          tier: 'retail',
          minQuantity: 1,
        },
      },
      update: { price: p.price },
      create: { productId: created.id, tier: 'retail', price: p.price, minQuantity: 1 },
    });

    console.log(`  ✓ ${p.variantId} — ${p.title.slice(0, 60)}…`);
  }

  console.log(`\n✅ Seeded ${products.length} flagship products across 6 brands.`);

  // Summary
  const summary = await prisma.brand.findMany({
    where: { slug: { in: ['honeywell', '3m', 'pip', 'master-lock', 'ansul', 'uvex'] } },
    select: { slug: true, name: true, _count: { select: { products: true } } },
    orderBy: { slug: 'asc' },
  });
  console.log('\nBrand product counts:');
  for (const b of summary) {
    console.log(`  ${b.slug.padEnd(14)} ${b._count.products} products`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
