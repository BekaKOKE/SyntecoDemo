import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PromotionsService } from './promotions.service';
import {
  BuyXGetYFreeStrategy,
  DiscountContext,
  DiscountStrategy,
  DiscountStrategyRegistry,
  FixedAmountDiscountStrategy,
  PercentageDiscountStrategy,
  VolumeTierDiscountStrategy,
} from './strategies';

const items = [{ productId: 'p1', title: 'Перчатки', quantity: 8, unitPrice: 2500 }]; // 20 000
const subtotal = 20000;

const promo = (over: Record<string, unknown> = {}) => ({
  id: 'promo-1', code: 'SAFETY10', name: 'Скидка 10%', description: null,
  strategy: 'percentage', value: 10, params: {}, minOrderAmount: 0,
  usageLimit: null, usedCount: 0, isActive: true, validFrom: null, validTo: null,
  createdAt: new Date(), updatedAt: new Date(),
  ...over,
});

const expectPromoError = async (p: Promise<unknown>, text: string) => {
  await expect(p).rejects.toMatchObject({ errorCode: ErrorCode.PROMO_INVALID, message: expect.stringContaining(text) });
};

describe('PromotionsService (Strategy client)', () => {
  let prisma: any;
  let registry: DiscountStrategyRegistry;
  let service: PromotionsService;

  beforeEach(() => {
    prisma = {
      promotion: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(({ data }) => Promise.resolve(promo(data))),
        update: jest.fn(({ data }) => Promise.resolve(promo(data))),
        delete: jest.fn(),
      },
    };
    registry = new DiscountStrategyRegistry([
      new PercentageDiscountStrategy(), new FixedAmountDiscountStrategy(),
      new VolumeTierDiscountStrategy(), new BuyXGetYFreeStrategy(),
    ]);
    service = new PromotionsService(prisma, registry);
  });

  it('returns zero discount when no code is given', async () => {
    const r = await service.evaluate('', items, subtotal);
    expect(r.amount).toBe(0);
    expect(prisma.promotion.findUnique).not.toHaveBeenCalled();
  });

  it('normalises the code (trim + upper case) and applies the promotion strategy', async () => {
    prisma.promotion.findUnique.mockResolvedValue(promo());
    const r = await service.evaluate('  safety10 ', items, subtotal);
    expect(prisma.promotion.findUnique).toHaveBeenCalledWith({ where: { code: 'SAFETY10' } });
    expect(r).toMatchObject({ code: 'SAFETY10', strategy: 'percentage', amount: 2000 });
  });

  it('picks a different algorithm for a different promotion at runtime', async () => {
    prisma.promotion.findUnique.mockResolvedValue(promo({ code: 'BUY3GET1', strategy: 'buy_x_get_y', value: 0, params: { buy: 3, free: 1 } }));
    const r = await service.evaluate('BUY3GET1', items, subtotal);
    expect(r).toMatchObject({ strategy: 'buy_x_get_y', amount: 5000 }); // 8 pcs → 2 free × 2500
  });

  it('rejects unknown, inactive, expired, not-started, exhausted and below-minimum codes', async () => {
    prisma.promotion.findUnique.mockResolvedValueOnce(null);
    await expectPromoError(service.evaluate('NOPE', items, subtotal), 'не найден');

    prisma.promotion.findUnique.mockResolvedValueOnce(promo({ isActive: false }));
    await expectPromoError(service.evaluate('X', items, subtotal), 'неактивен');

    prisma.promotion.findUnique.mockResolvedValueOnce(promo({ validTo: new Date('2020-01-01') }));
    await expectPromoError(service.evaluate('X', items, subtotal), 'истёк');

    prisma.promotion.findUnique.mockResolvedValueOnce(promo({ validFrom: new Date('2999-01-01') }));
    await expectPromoError(service.evaluate('X', items, subtotal), 'не начался');

    prisma.promotion.findUnique.mockResolvedValueOnce(promo({ usageLimit: 5, usedCount: 5 }));
    await expectPromoError(service.evaluate('X', items, subtotal), 'Лимит');

    prisma.promotion.findUnique.mockResolvedValueOnce(promo({ minOrderAmount: 50000 }));
    await expectPromoError(service.evaluate('X', items, subtotal), 'Минимальная сумма');
  });

  it('switches an existing promotion to another strategy at runtime (admin update)', async () => {
    const stored = promo();
    prisma.promotion.findUnique.mockResolvedValue(stored);
    expect((await service.evaluate('SAFETY10', items, subtotal)).amount).toBe(2000); // 10%

    prisma.promotion.update.mockImplementation(({ data }: any) => {
      Object.assign(stored, data);
      return Promise.resolve(stored);
    });
    await service.update('promo-1', { strategy: 'fixed_amount', value: 3000 });

    const after = await service.evaluate('SAFETY10', items, subtotal);
    expect(after).toMatchObject({ strategy: 'fixed_amount', amount: 3000 });
  });

  it('validates strategy configuration on create', async () => {
    prisma.promotion.findUnique.mockResolvedValue(null);
    await expect(service.create({ code: 'BAD', name: 'x', strategy: 'percentage', value: 0 }))
      .rejects.toMatchObject({ errorCode: ErrorCode.VALIDATION_ERROR });
    await expect(service.create({ code: 'BAD', name: 'x', strategy: 'unknown', value: 5 }))
      .rejects.toMatchObject({ errorCode: ErrorCode.DISCOUNT_STRATEGY_UNKNOWN });
  });

  it('rejects a duplicate promo code', async () => {
    prisma.promotion.findUnique.mockResolvedValue(promo());
    await expect(service.create({ code: 'safety10', name: 'dup', strategy: 'percentage', value: 5 }))
      .rejects.toMatchObject({ errorCode: ErrorCode.PROMO_CODE_EXISTS });
  });

  it('uses a newly registered strategy without any change to PromotionsService', async () => {
    const seasonal: DiscountStrategy = {
      type: 'seasonal_double',
      label: 'Двойной процент по выходным',
      calculate: (c: DiscountContext) => ({ amount: (c.subtotal * c.value * 2) / 100, description: 'x2' }),
      validateConfig: () => [],
    };
    registry.register(seasonal);
    prisma.promotion.findUnique.mockResolvedValue(promo({ strategy: 'seasonal_double', value: 5 }));

    const r = await service.evaluate('WEEKEND', items, subtotal);
    expect(r).toMatchObject({ strategy: 'seasonal_double', amount: 2000 });
  });

  it('counts usage inside the order transaction', async () => {
    const tx = { promotion: { update: jest.fn() } } as any;
    await service.markUsed('promo-1', tx);
    expect(tx.promotion.update).toHaveBeenCalledWith({ where: { id: 'promo-1' }, data: { usedCount: { increment: 1 } } });
  });

  it('rejects renaming a promotion to a code that is already taken', async () => {
    prisma.promotion.findUnique
      .mockResolvedValueOnce(promo({ id: 'promo-1' }))
      .mockResolvedValueOnce(promo({ id: 'promo-2', code: 'MINUS5000' }));
    await expect(service.update('promo-1', { code: 'minus5000' }))
      .rejects.toMatchObject({ errorCode: ErrorCode.PROMO_CODE_EXISTS });
  });

  it('throws PROMO_NOT_FOUND when updating a missing promotion', async () => {
    prisma.promotion.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', { value: 5 })).rejects.toBeInstanceOf(AppException);
  });
});
