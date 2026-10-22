import { OrderCost, OrderCostDecorator } from './order-cost.component';

/** Concrete decorator #1 — express delivery within 24h, flat fee. */
export class ExpressDeliveryDecorator extends OrderCostDecorator {
  static readonly FEE = 7500;
  readonly code = 'express_delivery';
  readonly label = 'Экспресс-доставка за 24 часа';

  protected extraCost(): number {
    return ExpressDeliveryDecorator.FEE;
  }
}

/** Concrete decorator #2 — cargo insurance, 1.5% of the wrapped cost (min 1 000 ₸). */
export class CargoInsuranceDecorator extends OrderCostDecorator {
  static readonly RATE = 0.015;
  static readonly MIN_FEE = 1000;
  readonly code = 'cargo_insurance';
  readonly label = 'Страхование груза (1,5%)';

  protected extraCost(): number {
    return Math.max(
      CargoInsuranceDecorator.MIN_FEE,
      Math.round(this.inner.getCost() * CargoInsuranceDecorator.RATE),
    );
  }
}

/** Concrete decorator #3 — certificates of conformity and product passports. */
export class CertificatePackageDecorator extends OrderCostDecorator {
  static readonly FEE = 2500;
  readonly code = 'certificates';
  readonly label = 'Пакет документов: сертификаты и паспорта';

  protected extraCost(): number {
    return CertificatePackageDecorator.FEE;
  }
}

/** Concrete decorator #4 — on-site installation / commissioning, 5% (min 15 000 ₸). */
export class InstallationDecorator extends OrderCostDecorator {
  static readonly RATE = 0.05;
  static readonly MIN_FEE = 15000;
  readonly code = 'installation';
  readonly label = 'Монтаж и пусконаладка на объекте (5%)';

  protected extraCost(): number {
    return Math.max(
      InstallationDecorator.MIN_FEE,
      Math.round(this.inner.getCost() * InstallationDecorator.RATE),
    );
  }
}

export type OrderCostDecoratorClass = new (inner: OrderCost) => OrderCostDecorator;
