import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { CartModule } from '../cart/cart.module';
import {
  BuyXGetYFreeStrategy,
  DISCOUNT_STRATEGIES,
  DiscountStrategyRegistry,
  FixedAmountDiscountStrategy,
  PercentageDiscountStrategy,
  VolumeTierDiscountStrategy,
} from './strategies';

/**
 * To add a discount algorithm: create a class implementing DiscountStrategy,
 * add it to STRATEGY_CLASSES. Nothing else changes.
 */
const STRATEGY_CLASSES = [
  PercentageDiscountStrategy,
  FixedAmountDiscountStrategy,
  VolumeTierDiscountStrategy,
  BuyXGetYFreeStrategy,
];

@Module({
  imports: [CartModule],
  controllers: [PromotionsController],
  providers: [
    ...STRATEGY_CLASSES,
    {
      provide: DISCOUNT_STRATEGIES,
      useFactory: (...strategies) => strategies,
      inject: STRATEGY_CLASSES,
    },
    DiscountStrategyRegistry,
    PromotionsService,
  ],
  exports: [PromotionsService],
})
export class PromotionsModule {}
