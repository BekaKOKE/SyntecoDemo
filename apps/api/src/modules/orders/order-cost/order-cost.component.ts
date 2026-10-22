/**
 * DECORATOR PATTERN — common component interface.
 *
 * An OrderCost knows its total (before VAT) and an itemised breakdown.
 * The concrete component (BaseOrderCost) covers goods and discount; optional
 * services are added by wrapping it in decorators that implement the same
 * interface, so they can be stacked in any combination at runtime.
 */

export interface CostLine {
  code: string;
  label: string;
  /** Positive = charge, negative = discount (KZT). */
  amount: number;
}

export interface OrderCost {
  getCost(): number;
  getLines(): CostLine[];
}

/** Concrete component — goods minus promo discount. */
export class BaseOrderCost implements OrderCost {
  constructor(
    private readonly subtotal: number,
    private readonly discount: number = 0,
    private readonly discountLabel: string = 'Скидка',
  ) {}

  getCost(): number {
    return this.subtotal - this.discount;
  }

  getLines(): CostLine[] {
    const lines: CostLine[] = [{ code: 'goods', label: 'Товары', amount: this.subtotal }];
    if (this.discount > 0) lines.push({ code: 'discount', label: this.discountLabel, amount: -this.discount });
    return lines;
  }
}

/**
 * Base decorator: holds a reference to the wrapped OrderCost and adds its own
 * charge on top. Subclasses only define `code`, `label` and `extraCost()`.
 */
export abstract class OrderCostDecorator implements OrderCost {
  abstract readonly code: string;
  abstract readonly label: string;

  constructor(protected readonly inner: OrderCost) {}

  protected abstract extraCost(): number;

  getCost(): number {
    return this.inner.getCost() + this.extraCost();
  }

  getLines(): CostLine[] {
    return [...this.inner.getLines(), { code: this.code, label: this.label, amount: this.extraCost() }];
  }
}
