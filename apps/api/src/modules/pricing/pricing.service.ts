import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { CreateTierDto, ResolvedPriceDto, PriceTierDto } from './dto/pricing.dto';

export interface ResolvedPrice {
  price: number;
  tier: string;
  originalPrice: number;
  discountPercent: number;
  savings: number;
}

/**
 * PricingService — B2B price resolution engine.
 *
 * Resolution order:
 *   1. Contract pricing (customer-specific, via contractId)
 *   2. Volume tier (quantity-based, highest minQuantity ≤ requested qty)
 *   3. Retail — product.basePrice fallback
 */
@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Price Resolution ────────────────────────────────

  /**
   * Resolve the effective price for a product given an optional customer and quantity.
   * Used by CartService and OrdersService to determine the correct price.
   */
  async resolvePrice(
    productId: string,
    customerId?: string,
    quantity: number = 1,
  ): Promise<ResolvedPrice> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, salePrice: true },
    });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${productId} not found`);

    const originalPrice = Number(product.salePrice ?? product.price);

    // 1. Contract pricing (if customer has a contract)
    if (customerId) {
      const company = await this.prisma.company.findFirst({
        where: { users: { some: { id: customerId } } },
        select: { contractId: true },
      });

      if (company?.contractId) {
        const contractPrice = await this.prisma.productPrice.findFirst({
          where: {
            productId,
            contractId: company.contractId,
            minQuantity: { lte: quantity },
            OR: [
              { validTo: null },
              { validTo: { gte: new Date() } },
            ],
          },
          orderBy: { minQuantity: 'desc' },
        });

        if (contractPrice) {
          const price = Number(contractPrice.price);
          return {
            price,
            tier: `contract`,
            originalPrice,
            discountPercent: Math.round((1 - price / originalPrice) * 1000) / 10,
            savings: originalPrice - price,
          };
        }
      }
    }

    // 2. Volume tier — find the best tier for this quantity
    const tierPrice = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        tier: { not: 'retail' },
        minQuantity: { lte: quantity },
        contractId: null,
        OR: [
          { validTo: null },
          { validTo: { gte: new Date() } },
        ],
      },
      orderBy: { minQuantity: 'desc' },
    });

    if (tierPrice) {
      const price = Number(tierPrice.price);
      return {
        price,
        tier: tierPrice.tier,
        originalPrice,
        discountPercent: Math.round((1 - price / originalPrice) * 1000) / 10,
        savings: originalPrice - price,
      };
    }

    // 3. Fallback: retail (base price)
    return {
      price: originalPrice,
      tier: 'retail',
      originalPrice,
      discountPercent: 0,
      savings: 0,
    };
  }

  /**
   * Resolve and enrich with product info — for the API response.
   */
  async resolvePriceEnriched(
    productId: string,
    customerId?: string,
    quantity: number = 1,
  ): Promise<ResolvedPriceDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, variantId: true, title: true },
    });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${productId} not found`);

    const resolved = await this.resolvePrice(productId, customerId, quantity);

    return {
      productId: product.id,
      variantId: product.variantId,
      title: product.title,
      quantity,
      ...resolved,
      unit: 'KZT',
    };
  }

  // ── Tier Management ──────────────────────────────────

  /**
   * Get all price tiers for a product.
   */
  async getTiers(productId: string): Promise<PriceTierDto[]> {
    const tiers = await this.prisma.productPrice.findMany({
      where: { productId },
      orderBy: { minQuantity: 'asc' },
    });

    return tiers.map(t => ({
      id: t.id,
      tier: t.tier,
      price: Number(t.price),
      minQuantity: t.minQuantity,
      contractId: t.contractId,
    }));
  }

  /**
   * Create or update a price tier for a product.
   */
  async upsertTier(dto: CreateTierDto) {
    const existing = await this.prisma.productPrice.findFirst({
      where: {
        productId: dto.productId,
        tier: dto.tier,
        minQuantity: dto.minQuantity ?? 1,
        contractId: dto.contractId ?? null,
      },
    });

    if (existing) {
      return this.prisma.productPrice.update({
        where: { id: existing.id },
        data: {
          price: dto.price,
          ...(dto.validFrom !== undefined && { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }),
          ...(dto.validTo !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
        },
      });
    }

    return this.prisma.productPrice.create({
      data: {
        id: uuid(),
        productId: dto.productId,
        tier: dto.tier,
        price: dto.price,
        minQuantity: dto.minQuantity ?? 1,
        contractId: dto.contractId ?? null,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
    });
  }

  /**
   * Seed volume tiers for a product (helper for bulk price setup).
   */
  async seedVolumeTiers(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });
    if (!product) return;

    const retail = Number(product.price);

    const tiers = [
      { tier: 'wholesale_10', minQty: 10, discount: 0.05 },
      { tier: 'wholesale_50', minQty: 50, discount: 0.12 },
      { tier: 'wholesale_100', minQty: 100, discount: 0.18 },
      { tier: 'wholesale_500', minQty: 500, discount: 0.25 },
    ];

    for (const t of tiers) {
      const exists = await this.prisma.productPrice.findFirst({
        where: { productId, tier: t.tier, minQuantity: t.minQty },
      });
      if (exists) continue;

      await this.prisma.productPrice.create({
        data: {
          id: uuid(),
          productId,
          tier: t.tier,
          price: Math.round(retail * (1 - t.discount)),
          minQuantity: t.minQty,
        },
      });
    }
  }
}
