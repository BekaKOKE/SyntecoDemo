import { Injectable } from '@nestjs/common';
import {
  DiscountContext, DiscountResult, DiscountStrategy, clampDiscount,
} from './discount-strategy.interface';

/**
 * Concrete strategy #4 — "buy X, get Y free" applied per cart line.
 *   params.buy  = paid units in a set (X)
 *   params.free = free units in a set (Y)
 * Example buy=3, free=1: 8 pcs → 2 sets → 2 pcs free.
 */
@Injectable()
export class BuyXGetYFreeStrategy implements DiscountStrategy {
  readonly type = 'buy_x_get_y';
  readonly label = 'Купи X — получи Y бесплатно';

  calculate({ subtotal, items, params }: DiscountContext): DiscountResult {
    const buy = Number(params.buy);
    const free = Number(params.free);
    let amount = 0;
    let freeUnits = 0;

    for (const item of items) {
      const sets = Math.floor(item.quantity / (buy + free));
      const units = sets * free;
      freeUnits += units;
      amount += units * item.unitPrice;
    }

    return {
      amount: clampDiscount(amount, subtotal),
      description: `Купи ${buy} — получи ${free} бесплатно (бесплатных единиц: ${freeUnits})`,
    };
  }

  validateConfig(_value: number, params: Record<string, unknown>): string[] {
    const buy = Number(params.buy);
    const free = Number(params.free);
    return Number.isInteger(buy) && buy >= 1 && Number.isInteger(free) && free >= 1
      ? []
      : ['params.buy и params.free должны быть целыми числами >= 1'];
  }
}
