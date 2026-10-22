import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Get or create a cart for a user or guest session.
   * Authenticated users: one cart per userId.
   * Guest users: one cart per sessionId.
   */
  private async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      let cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await this.prisma.cart.create({ data: { userId } });
      }
      return cart;
    }

    // Guest cart
    const sid = sessionId ?? uuid();
    let cart = await this.prisma.cart.findUnique({ where: { sessionId: sid } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { sessionId: sid } });
    }
    return cart;
  }

  /**
   * Add an item to the cart.
   * If the product already exists in the cart, increments quantity.
   * Snapshots the current retail price at time of add.
   */
  async addItem(
    productId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
  ) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${productId} not found`);
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    // Resolve price through the pricing engine (contract, volume tier, or retail)
    const resolved = await this.pricingService.resolvePrice(productId, userId, quantity);
    const unitPrice = resolved.price;

    // Upsert: if exists, increment quantity; otherwise create
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          unitPrice,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice,
        },
      });
    }

    // Touch cart updatedAt
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId, sessionId ?? cart.sessionId ?? undefined);
  }

  /**
   * Get the full cart with items, product details, and totals.
   */
  async getCart(userId?: string, sessionId?: string) {
    const where = userId
      ? { userId }
      : { sessionId: sessionId ?? undefined };

    const cart = await this.prisma.cart.findFirst({
      where,
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!cart) {
      return { id: '', items: [], itemCount: 0, totalAmount: 0 };
    }

    // Enrich items with product info
    const productIds = cart.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const items = cart.items.map(item => {
      const p = productMap.get(item.productId);
      const qty = item.quantity;
      const up = Number(item.unitPrice ?? p?.price ?? 0);
      return {
        id: item.id,
        productId: item.productId,
        variantId: p?.variantId ?? '',
        title: p?.title ?? 'Unknown',
        brandName: p?.brand?.name ?? '',
        quantity: qty,
        unitPrice: up,
        totalPrice: up * qty,
        imageUrl: p?.images[0]?.url ?? p?.imageUrl ?? null,
      };
    });

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
    };
  }

  /**
   * Update the quantity of a cart item.
   * Setting quantity to 0 removes the item.
   */
  async updateItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND, `CartItem ${itemId} not found`);
    }

    if (quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(userId, sessionId ?? cart.sessionId ?? undefined);
  }

  /**
   * Remove an item from the cart.
   */
  async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND, `CartItem ${itemId} not found`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId, sessionId ?? cart.sessionId ?? undefined);
  }

  /**
   * Clear all items from the cart.
   */
  async clearCart(userId?: string, sessionId?: string) {
    const where = userId
      ? { userId }
      : { sessionId: sessionId ?? undefined };

    const cart = await this.prisma.cart.findFirst({ where });

    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Merge a guest cart into an authenticated user's cart on login.
   * Called by AuthService after successful login/register.
   */
  async mergeGuestCart(userId: string, sessionId: string) {
    if (!sessionId) return;

    const guestCart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getOrCreateCart(userId, undefined);

    for (const guestItem of guestCart.items) {
      const existing = await this.prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
      });

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + guestItem.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
            unitPrice: guestItem.unitPrice,
          },
        });
      }
    }

    // Delete the guest cart
    await this.prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await this.prisma.cart.delete({ where: { id: guestCart.id } });
  }

  /**
   * Cron job: delete abandoned guest carts older than 7 days.
   * Runs daily at 3:00 AM. Prevents cart table bloat.
   */
  // @Cron('0 3 * * *') — uncomment when @nestjs/schedule is properly configured
  async cleanupAbandonedCarts(): Promise<{ deleted: number }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Delete cart items first (no cascade in schema)
    const oldCarts = await this.prisma.cart.findMany({
      where: {
        userId: null, // guest carts only
        updatedAt: { lt: sevenDaysAgo },
      },
      select: { id: true },
    });

    if (oldCarts.length === 0) return { deleted: 0 };

    const cartIds = oldCarts.map(c => c.id);
    await this.prisma.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
    await this.prisma.cart.deleteMany({ where: { id: { in: cartIds } } });

    return { deleted: cartIds.length };
  }
}
