import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CartService } from './cart.service';

/**
 * Scheduled tasks for cart maintenance.
 * The @nestjs/schedule Cron decorator runs these on a timer.
 */
@Injectable()
export class CartSchedulerService {
  private readonly logger = new Logger('CartScheduler');

  constructor(private readonly cartService: CartService) {}

  @Cron('0 3 * * *') // Daily at 3:00 AM
  async handleAbandonedCartCleanup() {
    this.logger.log('Starting abandoned cart cleanup...');
    try {
      const result = await this.cartService.cleanupAbandonedCarts();
      this.logger.log(`Cleaned up ${result.deleted} abandoned guest carts`);
    } catch (err: any) {
      this.logger.error(`Cart cleanup failed: ${err.message}`);
    }
  }
}
