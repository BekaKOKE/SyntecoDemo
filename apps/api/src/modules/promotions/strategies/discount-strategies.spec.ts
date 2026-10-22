import { AppException } from '../../../common/errors/app-exception';
import {
  BuyXGetYFreeStrategy,
  DiscountContext,
  DiscountResult,
  DiscountStrategy,
  DiscountStrategyRegistry,
  FixedAmountDiscountStrategy,
  PercentageDiscountStrategy,
  VolumeTierDiscountStrategy,
  clampDiscount,
} from './index';

const items = [
  { productId: 'gloves', title: 'Перчатки', quantity: 12, unitPrice: 1000 },  // 12 000
  { productId: 'helmet', title: 'Каска', quantity: 2, unitPrice: 9000 },      // 18 000
];
const ctx = (value: number, params: Record<string, unknown> = {}): DiscountContext => ({
  subtotal: 30000, items, value, params,
});

describe('Strategy pattern — discount strategies', () => {
  describe('PercentageDiscountStrategy', () => {
    const s = new PercentageDiscountStrategy();

    it('takes the percent of the subtotal', () => {
      expect(s.calculate(ctx(10)).amount).toBe(3000);
    });

    it('respects maxDiscount cap', () => {
      expect(s.calculate(ctx(50, { maxDiscount: 5000 })).amount).toBe(5000);
    });

    it('rejects percent outside (0; 100]', () => {
      expect(s.validateConfig(0, {})).toHaveLength(1);
      expect(s.validateConfig(150, {})).toHaveLength(1);
      expect(s.validateConfig(15, {})).toHaveLength(0);
    });
  });

  describe('FixedAmountDiscountStrategy', () => {
    const s = new FixedAmountDiscountStrategy();

    it('subtracts a fixed amount', () => {
      expect(s.calculate(ctx(5000)).amount).toBe(5000);
    });

    it('never exceeds the subtotal', () => {
      expect(s.calculate(ctx(999999)).amount).toBe(30000);
    });

    it('rejects non-positive amount', () => {
      expect(s.validateConfig(0, {})).toHaveLength(1);
    });
  });

  describe('VolumeTierDiscountStrategy', () => {
    const s = new VolumeTierDiscountStrategy();
    const tiers = { tiers: [{ minQuantity: 10, percent: 5 }, { minQuantity: 50, percent: 10 }] };

    it('applies the tier reached by each line quantity only', () => {
      // gloves: 12 pcs → 5% of 12 000 = 600; helmet: 2 pcs → no tier
      const r = s.calculate(ctx(0, tiers));
      expect(r.amount).toBe(600);
      expect(r.description).toContain('Перчатки');
    });

    it('picks the highest tier available', () => {
      const r = s.calculate({ subtotal: 60000, items: [{ productId: 'x', quantity: 60, unitPrice: 1000 }], value: 0, params: tiers });
      expect(r.amount).toBe(6000); // 10%
    });

    it('requires at least one valid tier', () => {
      expect(s.validateConfig(0, {})).toHaveLength(1);
      expect(s.validateConfig(0, { tiers: [{ minQuantity: 0, percent: 5 }] })).toHaveLength(1);
      expect(s.validateConfig(0, tiers)).toHaveLength(0);
    });
  });

  describe('BuyXGetYFreeStrategy', () => {
    const s = new BuyXGetYFreeStrategy();

    it('gives Y free units for every X+Y units of a line', () => {
      // buy 3 get 1: gloves 12 → 3 free × 1000; helmet 2 → 0
      expect(s.calculate(ctx(0, { buy: 3, free: 1 })).amount).toBe(3000);
    });

    it('requires integer buy/free >= 1', () => {
      expect(s.validateConfig(0, { buy: 0, free: 1 })).toHaveLength(1);
      expect(s.validateConfig(0, { buy: 2.5, free: 1 })).toHaveLength(1);
      expect(s.validateConfig(0, { buy: 3, free: 1 })).toHaveLength(0);
    });
  });

  it('clampDiscount rounds and keeps the value inside [0, subtotal]', () => {
    expect(clampDiscount(-5, 100)).toBe(0);
    expect(clampDiscount(NaN, 100)).toBe(0);
    expect(clampDiscount(10.6, 100)).toBe(11);
    expect(clampDiscount(500, 100)).toBe(100);
  });

  describe('DiscountStrategyRegistry — runtime selection', () => {
    const registry = new DiscountStrategyRegistry([
      new PercentageDiscountStrategy(),
      new FixedAmountDiscountStrategy(),
      new VolumeTierDiscountStrategy(),
      new BuyXGetYFreeStrategy(),
    ]);

    it('resolves strategies by type string at runtime', () => {
      const chosen = ['percentage', 'fixed_amount'].map(t => registry.get(t).calculate(ctx(10)).amount);
      expect(chosen).toEqual([3000, 10]);
    });

    it('lists all registered strategies', () => {
      expect(registry.list().map(s => s.type)).toEqual(['percentage', 'fixed_amount', 'volume_tier', 'buy_x_get_y']);
    });

    it('throws DISCOUNT_STRATEGY_UNKNOWN for an unknown type', () => {
      expect(() => registry.get('magic')).toThrow(AppException);
    });

    it('accepts a brand-new strategy without changing existing code', () => {
      // A strategy invented after the system was written: 500 ₸ off per distinct product line.
      class PerLineDiscountStrategy implements DiscountStrategy {
        readonly type = 'per_line';
        readonly label = 'Скидка за каждую позицию';
        calculate(c: DiscountContext): DiscountResult {
          return { amount: clampDiscount(c.items.length * c.value, c.subtotal), description: 'per line' };
        }
        validateConfig(): string[] { return []; }
      }

      registry.register(new PerLineDiscountStrategy());
      expect(registry.get('per_line').calculate(ctx(500)).amount).toBe(1000);
    });
  });
});
