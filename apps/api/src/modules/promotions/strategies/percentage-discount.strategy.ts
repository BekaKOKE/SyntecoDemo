import { Injectable } from '@nestjs/common';
import {
  DiscountContext, DiscountResult, DiscountStrategy, clampDiscount,
} from './discount-strategy.interface';

/**
 * Concrete strategy #1 — percentage of the order subtotal.
 *   value             = percent (0 < value <= 100)
 *   params.maxDiscount = optional cap in KZT
 */
@Injectable()
export class PercentageDiscountStrategy implements DiscountStrategy {
  readonly type = 'percentage';
  readonly label = 'Процент от суммы заказа';

  calculate({ subtotal, value, params }: DiscountContext): DiscountResult {
    let amount = (subtotal * value) / 100;
    const cap = Number(params.maxDiscount ?? 0);
    if (cap > 0) amount = Math.min(amount, cap);

    return {
      amount: clampDiscount(amount, subtotal),
      description: cap > 0
        ? `Скидка ${value}% (не более ${cap} ₸)`
        : `Скидка ${value}%`,
    };
  }

  validateConfig(value: number, params: Record<string, unknown>): string[] {
    const errors: string[] = [];
    if (!(value > 0 && value <= 100)) errors.push('Процент должен быть в диапазоне (0; 100]');
    if (params.maxDiscount !== undefined && !(Number(params.maxDiscount) >= 0)) {
      errors.push('maxDiscount должен быть неотрицательным числом');
    }
    return errors;
  }
}
