import { AppException } from '../../../common/errors/app-exception';
import { BaseOrderCost, OrderCost, OrderCostDecorator } from './order-cost.component';
import {
  CargoInsuranceDecorator,
  CertificatePackageDecorator,
  ExpressDeliveryDecorator,
  InstallationDecorator,
} from './order-cost.decorators';
import { buildOrderCost, listOrderServices } from './order-services.catalog';

describe('Decorator pattern — optional order services', () => {
  const base = () => new BaseOrderCost(100000, 10000, 'Промокод');

  it('base component: goods minus discount', () => {
    const cost = base();
    expect(cost.getCost()).toBe(90000);
    expect(cost.getLines()).toEqual([
      { code: 'goods', label: 'Товары', amount: 100000 },
      { code: 'discount', label: 'Промокод', amount: -10000 },
    ]);
  });

  it('each decorator wraps an OrderCost and adds its own charge', () => {
    expect(new ExpressDeliveryDecorator(base()).getCost()).toBe(97500);
    expect(new CertificatePackageDecorator(base()).getCost()).toBe(92500);
    expect(new CargoInsuranceDecorator(base()).getCost()).toBe(91350);   // +1.5% of 90 000
    expect(new InstallationDecorator(base()).getCost()).toBe(105000);    // +min 15 000
  });

  it('decorators can be stacked; percentage services see the wrapped total', () => {
    const cost = new CargoInsuranceDecorator(new ExpressDeliveryDecorator(base()));
    // 90 000 + 7 500 = 97 500; insurance 1.5% of 97 500 = 1 463
    expect(cost.getCost()).toBe(98963);
    expect(cost.getLines().map(l => l.code)).toEqual(['goods', 'discount', 'express_delivery', 'cargo_insurance']);
  });

  it('a decorator works on top of another decorator of the same type', () => {
    const doubleExpress = new ExpressDeliveryDecorator(new ExpressDeliveryDecorator(base()));
    expect(doubleExpress.getCost()).toBe(105000);
  });

  it('applies minimum fees for small orders', () => {
    const small = new BaseOrderCost(20000);
    expect(new CargoInsuranceDecorator(small).getCost()).toBe(21000);
    expect(new InstallationDecorator(small).getCost()).toBe(35000);
  });

  it('buildOrderCost combines any selection in a deterministic order', () => {
    const a = buildOrderCost(100000, 0, ['cargo_insurance', 'express_delivery']);
    const b = buildOrderCost(100000, 0, ['express_delivery', 'cargo_insurance', 'express_delivery']);
    expect(a.getCost()).toBe(b.getCost());
    expect(a.getLines().map(l => l.code)).toEqual(['goods', 'express_delivery', 'cargo_insurance']);
  });

  it('buildOrderCost with all four services', () => {
    const cost = buildOrderCost(200000, 0, ['express_delivery', 'certificates', 'cargo_insurance', 'installation']);
    // 200 000 + 7 500 + 2 500 = 210 000; +1.5% = 3 150 → 213 150;
    // installation 5% = 10 658 < min 15 000 → 228 150
    expect(cost.getCost()).toBe(228150);
    expect(cost.getLines()).toHaveLength(5);
  });

  it('rejects unknown service codes', () => {
    expect(() => buildOrderCost(1000, 0, ['teleportation'])).toThrow(AppException);
  });

  it('without services the base component is returned unchanged', () => {
    const cost = buildOrderCost(5000, 0, []);
    expect(cost).toBeInstanceOf(BaseOrderCost);
    expect(cost.getCost()).toBe(5000);
  });

  it('new functionality is added without modifying BaseOrderCost or existing decorators', () => {
    // Gift wrapping was never planned — it is just another decorator.
    class GiftWrapDecorator extends OrderCostDecorator {
      readonly code = 'gift_wrap';
      readonly label = 'Подарочная упаковка';
      protected extraCost() { return 1200; }
    }
    const cost: OrderCost = new GiftWrapDecorator(new ExpressDeliveryDecorator(base()));
    expect(cost.getCost()).toBe(98700);
    expect(cost.getLines().slice(-1)[0]).toEqual({ code: 'gift_wrap', label: 'Подарочная упаковка', amount: 1200 });
  });

  it('exposes the service catalog for the UI', () => {
    expect(listOrderServices().map(s => s.code)).toEqual(['express_delivery', 'certificates', 'cargo_insurance', 'installation']);
  });
});
