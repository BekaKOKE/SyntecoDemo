/**
 * STRATEGY PATTERN — common strategy interface.
 *
 * Every discount algorithm implements DiscountStrategy. The client code
 * (PromotionsService → OrdersService) only depends on this interface and
 * picks the concrete implementation at runtime by `type`, which comes from
 * the promotion record selected by the customer's promo code.
 *
 * Adding a new algorithm = one new class + registering it in
 * PromotionsModule. No changes in PromotionsService or OrdersService.
 */

/** Injection token for the list of all registered strategies. */
export const DISCOUNT_STRATEGIES = Symbol('DISCOUNT_STRATEGIES');

export interface DiscountLineItem {
  productId: string;
  title?: string;
  quantity: number;
  unitPrice: number;
}

/** Everything a strategy needs to compute a discount. */
export interface DiscountContext {
  /** Sum of all line totals before discount (KZT). */
  subtotal: number;
  items: DiscountLineItem[];
  /** Main numeric parameter of the promotion (percent, amount, ...). */
  value: number;
  /** Strategy-specific extra parameters (tiers, buy/free counts, caps). */
  params: Record<string, unknown>;
}

export interface DiscountResult {
  /** Discount amount in KZT, already clamped to [0, subtotal]. */
  amount: number;
  /** Human-readable explanation shown to the customer. */
  description: string;
}

export interface DiscountStrategy {
  /** Stable identifier stored in `promotions.strategy`. */
  readonly type: string;
  /** Name shown in the admin panel. */
  readonly label: string;

  calculate(context: DiscountContext): DiscountResult;

  /** Returns a list of configuration errors (empty = valid). */
  validateConfig(value: number, params: Record<string, unknown>): string[];
}

/** Rounds to whole tenge and keeps the discount inside [0, subtotal]. */
export function clampDiscount(amount: number, subtotal: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.min(Math.round(amount), Math.round(subtotal));
}
