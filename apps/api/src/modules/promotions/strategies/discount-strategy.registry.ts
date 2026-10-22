import { Inject, Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../../common/errors/app-exception';
import { DISCOUNT_STRATEGIES, DiscountStrategy } from './discount-strategy.interface';

/**
 * Looks up a DiscountStrategy by its `type` at runtime.
 *
 * The registry receives every strategy through the DISCOUNT_STRATEGIES
 * multi-provider, so it never references concrete classes — new strategies
 * become available as soon as they are registered in PromotionsModule.
 */
@Injectable()
export class DiscountStrategyRegistry {
  private readonly byType = new Map<string, DiscountStrategy>();

  constructor(@Inject(DISCOUNT_STRATEGIES) strategies: DiscountStrategy[]) {
    strategies.forEach(s => this.register(s));
  }

  register(strategy: DiscountStrategy): void {
    this.byType.set(strategy.type, strategy);
  }

  has(type: string): boolean {
    return this.byType.has(type);
  }

  get(type: string): DiscountStrategy {
    const strategy = this.byType.get(type);
    if (!strategy) {
      throw new AppException(
        ErrorCode.DISCOUNT_STRATEGY_UNKNOWN,
        `Unknown discount strategy "${type}". Available: ${[...this.byType.keys()].join(', ')}`,
      );
    }
    return strategy;
  }

  list(): { type: string; label: string }[] {
    return [...this.byType.values()].map(s => ({ type: s.type, label: s.label }));
  }
}
