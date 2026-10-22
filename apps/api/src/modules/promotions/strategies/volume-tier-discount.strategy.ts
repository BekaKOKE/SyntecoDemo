import { Injectable } from '@nestjs/common';
import {
  DiscountContext, DiscountResult, DiscountStrategy, clampDiscount,
} from './discount-strategy.interface';

export interface VolumeTier {
  minQuantity: number;
  percent: number;
}

/**
 * Concrete strategy #3 — B2B wholesale discount by line quantity.
 * Each cart line gets the percent of the highest tier its quantity reaches.
 *   params.tiers = [{ minQuantity: 10, percent: 3 }, { minQuantity: 50, percent: 7 }]
 */
@Injectable()
export class VolumeTierDiscountStrategy implements DiscountStrategy {
  readonly type = 'volume_tier';
  readonly label = 'Оптовая скидка от количества';

  calculate({ subtotal, items, params }: DiscountContext): DiscountResult {
    const tiers = this.parseTiers(params);
    let amount = 0;
    const applied: string[] = [];

    for (const item of items) {
      const tier = tiers.find(t => item.quantity >= t.minQuantity);
      if (!tier) continue;
      amount += (item.unitPrice * item.quantity * tier.percent) / 100;
      applied.push(`${item.title ?? item.productId}: −${tier.percent}%`);
    }

    return {
      amount: clampDiscount(amount, subtotal),
      description: applied.length
        ? `Оптовая скидка (${applied.join('; ')})`
        : 'Оптовая скидка: ни одна позиция не достигла минимального количества',
    };
  }

  validateConfig(_value: number, params: Record<string, unknown>): string[] {
    const tiers = this.parseTiers(params);
    if (tiers.length === 0) return ['Нужен хотя бы один уровень tiers: [{ minQuantity, percent }]'];
    const bad = tiers.some(t => !(t.minQuantity >= 1) || !(t.percent > 0 && t.percent <= 100));
    return bad ? ['Каждый уровень: minQuantity >= 1, percent в (0; 100]'] : [];
  }

  /** Tiers sorted from the highest threshold down, so `find` picks the best one. */
  private parseTiers(params: Record<string, unknown>): VolumeTier[] {
    const raw = Array.isArray(params.tiers) ? params.tiers : [];
    return raw
      .map((t: any) => ({ minQuantity: Number(t?.minQuantity), percent: Number(t?.percent) }))
      .filter(t => Number.isFinite(t.minQuantity) && Number.isFinite(t.percent))
      .sort((a, b) => b.minQuantity - a.minQuantity);
  }
}
