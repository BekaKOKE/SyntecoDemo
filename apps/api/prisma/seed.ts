// Synteco Database Seed Script
// Populates initial data: admin user, warehouses, categories, sample products
// Run: pnpm --filter @synteco/api db:seed

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Synteco database...\n');

  // ── 1. Create admin user ──
  console.log('Creating admin user...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@synteco.kz';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  if (process.env.NODE_ENV === 'production' && (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD)) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required in production');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      firstName: 'Bekzhan',
      lastName: 'Sauytbek',
      role: UserRole.super_admin,
      isActive: true,
      phone: '+77011234567',
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Bekzhan',
      lastName: 'Sauytbek',
      role: UserRole.super_admin,
      phone: '+77011234567',
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // ── 2. Create warehouses ──
  console.log('Creating warehouses...');
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: 'ALA' },
      update: {},
      create: { name: 'Алматы', code: 'ALA', address: 'г. Алматы, пр. Райымбека, 245' },
    }),
    prisma.warehouse.upsert({
      where: { code: 'AST' },
      update: {},
      create: { name: 'Астана', code: 'AST', address: 'г. Астана, ш. Коргалжын, 13' },
    }),
    prisma.warehouse.upsert({
      where: { code: 'SHY' },
      update: {},
      create: { name: 'Шымкент', code: 'SHY', address: 'г. Шымкент, ул. Тауке-хана, 88' },
    }),
    prisma.warehouse.upsert({
      where: { code: 'ATY' },
      update: {},
      create: { name: 'Атырау', code: 'ATY', address: 'г. Атырау, ул. Сатпаева, 23' },
    }),
  ]);
  console.log(`  ✓ ${warehouses.length} warehouses created`);

  // ── 3. Create top-level categories ──
  console.log('Creating categories...');
  const categoryData = [
    { name: 'Безопасность', slug: 'bezopasnost', path: 'bezopasnost', level: 1 },
    { name: 'Инструменты', slug: 'instrumenty', path: 'instrumenty', level: 1 },
    { name: 'Электрика', slug: 'elektrika', path: 'elektrika', level: 1 },
    { name: 'Пневматика', slug: 'pnevmatika', path: 'pnevmatika', level: 1 },
    { name: 'Гидравлика', slug: 'gidravlika', path: 'gidravlika', level: 1 },
    { name: 'Крепеж', slug: 'krepezh', path: 'krepezh', level: 1 },
    { name: 'Подшипники', slug: 'podshipniki', path: 'podshipniki', level: 1 },
    { name: 'Двигатели', slug: 'dvigateli', path: 'dvigateli', level: 1 },
    { name: 'Сварка', slug: 'svarka', path: 'svarka', level: 1 },
    { name: 'Сантехника', slug: 'santekhnika', path: 'santekhnika', level: 1 },
    { name: 'Уборка', slug: 'uborka', path: 'uborka', level: 1 },
    { name: 'Упаковка', slug: 'upakovka', path: 'upakovka', level: 1 },
    { name: 'Лаборатория', slug: 'laboratoriya', path: 'laboratoriya', level: 1 },
    { name: 'Автопарк', slug: 'avtopark', path: 'avtopark', level: 1 },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created;
  }
  console.log(`  ✓ ${Object.keys(categories).length} categories created`);

  // ── 4. Create sample subcategories ──
  console.log('Creating subcategories...');
  const subcategories = [
    { name: 'Электроинструменты', slug: 'elektroinstrumenty', parent: 'instrumenty', path: 'instrumenty.elektroinstrumenty', level: 2 },
    { name: 'Ручной инструмент', slug: 'ruchnoy-instrument', parent: 'instrumenty', path: 'instrumenty.ruchnoy-instrument', level: 2 },
    { name: 'Пневмоцилиндры', slug: 'pnevmo-tsilindry', parent: 'pnevmatika', path: 'pnevmatika.pnevmo-tsilindry', level: 2 },
    { name: 'СИЗ', slug: 'siz', parent: 'bezopasnost', path: 'bezopasnost.siz', level: 2 },
    { name: 'Кабели и провода', slug: 'kabeli', parent: 'elektrika', path: 'elektrika.kabeli', level: 2 },
  ];

  const subCatMap: Record<string, any> = {};
  for (const sub of subcategories) {
    const created = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: {
        name: sub.name,
        slug: sub.slug,
        path: sub.path,
        level: sub.level,
        parentId: categories[sub.parent].id,
      },
    });
    subCatMap[sub.slug] = created;
  }
  console.log(`  ✓ ${subcategories.length} subcategories created`);

  // ── 5. Create sample brands ──
  console.log('Creating brands...');
  const brandNames = ['Bosch', 'Makita', 'DeWalt', 'SPEEDAIRE', 'CAMBRO', '3M', 'Honeywell', 'Siemens', 'ABB', 'Schneider Electric'];
  const brands: Record<string, any> = {};

  for (const name of brandNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const created = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    brands[slug] = created;
  }
  console.log(`  ✓ ${Object.keys(brands).length} brands created`);

  // ── 6. Create sample products ──
  console.log('Creating sample products...');
  const sampleProducts = [
    {
      variantId: '5THK4',
      itemId: null,
      title: 'Пневмоцилиндр круглого сечения SPEEDAIRE: 3/4" отверстие, 12" ход',
      description: 'Цилиндр двустороннего действия из нержавеющей стали. Магнитный поршень. Вход воздуха 1/8" NPT.',
      brandSlug: 'speedaire',
      categorySlugs: ['pnevmo-tsilindry'],
      price: 56880,
      mpn: 'NCDMR075-1200',
      attributes: {
        'Диаметр отверстия': '3/4"',
        'Длина хода': '12"',
        'Материал корпуса': 'Нержавеющая сталь',
        'Тип': 'Двустороннего действия',
        'Вход воздуха': '1/8" NPT',
      },
      stock: { ALA: 45, AST: 30, SHY: 15, ATY: 8 },
    },
    {
      variantId: '893XW0',
      itemId: null,
      title: 'Стеллаж Cambro Elements Xtra: 4 полки, 64" высота, 24" глубина, 70" длина',
      description: 'Добавочный стеллаж для коммерческих кухонь. Совместим со стартовыми стеллажами. 4 полки (1 сплошная, 3 вентилируемые).',
      brandSlug: 'cambro',
      categorySlugs: ['laboratoriya'],
      price: 371085,
      mpn: 'EXA247264VS4480',
      attributes: {
        'Высота': '64"',
        'Глубина': '24"',
        'Длина': '70"',
        'Количество полок': '4',
        'Нагрузка': '2,400 lb',
        'Цвет': 'Серый',
      },
      stock: { ALA: 12, AST: 5, SHY: 0, ATY: 3 },
    },
    {
      variantId: 'BOSCH-GBH-2-28',
      itemId: null,
      title: 'Перфоратор Bosch GBH 2-28: SDS-Plus, 880 Вт, 3.2 Дж',
      description: 'Профессиональный перфоратор для сверления и долбления в бетоне. Быстрозажимной патрон SDS-Plus. Антивибрационная система.',
      brandSlug: 'bosch',
      categorySlugs: ['elektroinstrumenty'],
      price: 185000,
      mpn: '06112670F1',
      attributes: {
        'Мощность': '880 Вт',
        'Энергия удара': '3.2 Дж',
        'Тип патрона': 'SDS-Plus',
        'Макс. диаметр в бетоне': '28 мм',
        'Вес': '3.1 кг',
      },
      stock: { ALA: 120, AST: 85, SHY: 42, ATY: 15 },
    },
  ];

  for (const p of sampleProducts) {
    const { brandSlug, categorySlugs, stock, ...productData } = p;

    const product = await prisma.product.upsert({
      where: { variantId: p.variantId },
      update: {},
      create: {
        ...productData,
        brandId: brands[brandSlug].id,
      },
    });

    // Link categories
    for (const catSlug of categorySlugs) {
      const cat = subCatMap[catSlug] ?? categories[catSlug];
      if (cat) {
        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
          update: {},
          create: { productId: product.id, categoryId: cat.id },
        });
      }
    }

    // Add stock per warehouse
    for (const [warehouseCode, qty] of Object.entries(stock)) {
      const wh = warehouses.find(w => w.code === warehouseCode);
      if (wh) {
        await prisma.productStock.upsert({
          where: { productId_warehouseId: { productId: product.id, warehouseId: wh.id } },
          update: { quantity: qty as number },
          create: { productId: product.id, warehouseId: wh.id, quantity: qty as number },
        });
      }
    }

    // Add retail price
    await prisma.productPrice.upsert({
      where: { productId_tier_minQuantity: { productId: product.id, tier: 'retail', minQuantity: 1 } },
      update: { price: p.price },
      create: { productId: product.id, tier: 'retail', price: p.price, minQuantity: 1 },
    });
  }
  console.log(`  ✓ ${sampleProducts.length} sample products created\n`);

  console.log('✅ Seed complete!');
  console.log(`   Admin login: ${adminEmail}`);
  console.log(`   API Docs: http://localhost:3000/api-docs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
