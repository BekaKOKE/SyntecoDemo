import { Injectable } from '@nestjs/common';
import {
  DiscountContext, DiscountResult, DiscountStrategy, clampDiscount,
} from './discount-strategy.interface';

/**
 * Concrete strategy #2 — fixed amount off the order.
 *   value = amount in KZT (never more than the subtotal)
 */
@Injectable()
export class FixedAmountDiscountStrategy implements DiscountStrategy {
  readonly type = 'fixed_amount';
  readonly label = 'Фиксированная сумма';

  calculate({ subtotal, value }: DiscountContext): DiscountResult {
    return {
      amount: clampDiscount(value, subtotal),
      description: `Скидка ${value} ₸ на заказ`,
    };
  }

  validateConfig(value: number): string[] {
    return value > 0 ? [] : ['Сумма скидки должна быть больше 0'];
  }
}
