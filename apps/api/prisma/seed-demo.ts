// Synteco Demo seed — demo accounts, promo codes (one per discount strategy)
// and stock top-up so every catalog product can be ordered.
// Run after the catalog snapshot: pnpm --filter @synteco/api db:demo

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  { email: 'admin@synteco.kz', password: 'Admin123!', firstName: 'Beksultan', lastName: 'Sauytbek', role: UserRole.super_admin, phone: '+77011234567' },
  { email: 'manager@synteco.kz', password: 'Manager123!', firstName: 'Айгерим', lastName: 'Менеджер', role: UserRole.manager, phone: '+77021234567' },
  { email: 'customer@synteco.kz', password: 'Customer123!', firstName: 'Иван', lastName: 'Покупатель', role: UserRole.customer_buyer, phone: '+77071234567' },
];

const now = new Date();
const inYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

const DEMO_PROMOTIONS = [
  {
    code: 'SAFETY10', name: 'Скидка 10% на заказ', strategy: 'percentage', value: 10,
    params: { maxDiscount: 100000 }, minOrderAmount: 0,
    description: 'PercentageDiscountStrategy: 10% от суммы, не более 100 000 ₸',
  },
  {
    code: 'MINUS5000', name: 'Минус 5 000 ₸', strategy: 'fixed_amount', value: 5000,
    params: {}, minOrderAmount: 30000,
    description: 'FixedAmountDiscountStrategy: 5 000 ₸ при заказе от 30 000 ₸',
  },
  {
    code: 'OPT2026', name: 'Оптовая скидка', strategy: 'volume_tier', value: 0,
    params: { tiers: [{ minQuantity: 10, percent: 3 }, { minQuantity: 50, percent: 7 }, { minQuantity: 100, percent: 12 }] },
    minOrderAmount: 0,
    description: 'VolumeTierDiscountStrategy: от 10 шт −3%, от 50 шт −7%, от 100 шт −12% на позицию',
  },
  {
    code: 'BUY3GET1', name: 'Купи 3 — получи 1', strategy: 'buy_x_get_y', value: 0,
    params: { buy: 3, free: 1 }, minOrderAmount: 0,
    description: 'BuyXGetYFreeStrategy: каждая 4-я единица позиции бесплатно',
  },
  {
    code: 'EXPIRED2025', name: 'Истёкшая акция (для демонстрации ошибки)', strategy: 'percentage', value: 50,
    params: {}, minOrderAmount: 0, validTo: new Date('2025-12-31T23:59:59Z'),
    description: 'Показывает обработку ошибки «срок действия истёк»',
  },
];

async function main() {
  console.log('🌱 Synteco demo seed\n');

  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, firstName: u.firstName, lastName: u.lastName, role: u.role, phone: u.phone, isActive: true },
      create: {
        email: u.email, passwordHash, firstName: u.firstName, lastName: u.lastName, role: u.role, phone: u.phone,
        consentAt: now, consentVersion: 'demo',
      },
    });
    console.log(`  ✓ ${u.role.padEnd(14)} ${u.email} / ${u.password}`);
  }

  for (const p of DEMO_PROMOTIONS) {
    const data = {
      name: p.name, description: p.description, strategy: p.strategy, value: p.value, params: p.params,
      minOrderAmount: p.minOrderAmount, isActive: true, validFrom: null, validTo: p.validTo ?? inYear,
    };
    await prisma.promotion.upsert({ where: { code: p.code }, update: data, create: { code: p.code, ...data } });
    console.log(`  ✓ promo ${p.code.padEnd(12)} → ${p.strategy}`);
  }

  // Every product gets a retail price and at least 200 units in Almaty so
  // that the full checkout flow can be demonstrated on any catalog item.
  const almaty = await prisma.warehouse.upsert({
    where: { code: 'ALA' },
    update: { isActive: true },
    create: { name: 'Алматы', code: 'ALA', address: 'г. Алматы, пр. Райымбека, 245' },
  });
  const stocked = await prisma.$executeRawUnsafe(`
    INSERT INTO product.product_stock (product_id, warehouse_id, quantity, reserved, reorder_point, updated_at)
    SELECT p.id, '${almaty.id}'::uuid, 200, 0, 10, now() FROM product.products p
    ON CONFLICT (product_id, warehouse_id) DO UPDATE SET quantity = GREATEST(product.product_stock.quantity, 200)
  `);
  const priced = await prisma.$executeRawUnsafe(`
    INSERT INTO product.product_prices (id, product_id, tier, price, min_quantity, created_at)
    SELECT gen_random_uuid(), p.id, 'retail', COALESCE(p.sale_price, p.price, 10000), 1, now()
    FROM product.products p
    WHERE NOT EXISTS (SELECT 1 FROM product.product_prices pp WHERE pp.product_id = p.id AND pp.tier = 'retail')
  `);
  console.log(`  ✓ stock rows upserted: ${stocked}, retail prices added: ${priced}`);

  console.log('\n✅ Demo data ready');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
