import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, Promotion } from '@prisma/client';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { DiscountLineItem, DiscountStrategyRegistry } from './strategies';
import { AppliedDiscount, CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';

export const NO_DISCOUNT: AppliedDiscount = {
  promotionId: null, code: null, strategy: null, amount: 0, description: null,
};

/**
 * Business rules for promo codes. The actual discount algorithm is delegated
 * to a DiscountStrategy chosen at runtime from the promotion's `strategy`
 * field — this service never branches on the strategy type.
 */
@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly strategies: DiscountStrategyRegistry,
  ) {}

  // ── Customer side ───────────────────────────────────

  /**
   * Computes the discount for a cart. An empty code means "no promotion".
   * Throws PROMO_INVALID with a reason the UI can show as-is.
   */
  async evaluate(
    code: string | undefined | null,
    items: DiscountLineItem[],
    subtotal: number,
  ): Promise<AppliedDiscount> {
    const normalized = code?.trim().toUpperCase();
    if (!normalized) return NO_DISCOUNT;

    const promotion = await this.prisma.promotion.findUnique({ where: { code: normalized } });
    this.assertUsable(promotion, subtotal);

    const strategy = this.strategies.get(promotion!.strategy);
    const result = strategy.calculate({
      subtotal,
      items,
      value: Number(promotion!.value),
      params: (promotion!.params ?? {}) as Record<string, unknown>,
    });

    return {
      promotionId: promotion!.id,
      code: promotion!.code,
      strategy: strategy.type,
      amount: result.amount,
      description: `${promotion!.name}: ${result.description}`,
    };
  }

  /** Counts one use of the promotion inside the order transaction. */
  async markUsed(promotionId: string, tx: Prisma.TransactionClient): Promise<void> {
    await tx.promotion.update({
      where: { id: promotionId },
      data: { usedCount: { increment: 1 } },
    });
  }

  // ── Admin side ──────────────────────────────────────

  listStrategies() {
    return this.strategies.list();
  }

  async findAll() {
    const rows = await this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.toResponse(r));
  }

  async create(dto: CreatePromotionDto) {
    const code = dto.code.trim().toUpperCase();
    this.assertValidConfig(dto.strategy, dto.value, dto.params ?? {});

    const exists = await this.prisma.promotion.findUnique({ where: { code } });
    if (exists) throw new AppException(ErrorCode.PROMO_CODE_EXISTS, `Promo code ${code} already exists`);

    const created = await this.prisma.promotion.create({
      data: {
        code,
        name: dto.name,
        description: dto.description ?? null,
        strategy: dto.strategy,
        value: dto.value,
        params: (dto.params ?? {}) as Prisma.InputJsonValue,
        minOrderAmount: dto.minOrderAmount ?? 0,
        usageLimit: dto.usageLimit ?? null,
        isActive: dto.isActive ?? true,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
    });
    return this.toResponse(created);
  }

  /** Also used to switch a promotion to another strategy at runtime. */
  async update(id: string, dto: UpdatePromotionDto) {
    const current = await this.prisma.promotion.findUnique({ where: { id } });
    if (!current) throw new AppException(ErrorCode.PROMO_NOT_FOUND, `Promotion ${id} not found`);

    const strategy = dto.strategy ?? current.strategy;
    const value = dto.value ?? Number(current.value);
    const params = dto.params ?? (current.params as Record<string, unknown>);
    this.assertValidConfig(strategy, value, params);

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();
      const clash = await this.prisma.promotion.findUnique({ where: { code } });
      if (clash && clash.id !== id) {
        throw new AppException(ErrorCode.PROMO_CODE_EXISTS, `Promo code ${code} already exists`);
      }
    }

    const updated = await this.prisma.promotion.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code.trim().toUpperCase() }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        strategy,
        value,
        params: params as Prisma.InputJsonValue,
        ...(dto.minOrderAmount !== undefined && { minOrderAmount: dto.minOrderAmount }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.validFrom !== undefined && { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }),
        ...(dto.validTo !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
      },
    });
    return this.toResponse(updated);
  }

  async remove(id: string) {
    const current = await this.prisma.promotion.findUnique({ where: { id } });
    if (!current) throw new AppException(ErrorCode.PROMO_NOT_FOUND, `Promotion ${id} not found`);
    await this.prisma.promotion.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Private ─────────────────────────────────────────

  private assertUsable(promotion: Promotion | null, subtotal: number): void {
    const invalid = (reason: string) => new AppException(ErrorCode.PROMO_INVALID, reason);
    const now = new Date();

    if (!promotion) throw invalid('Промокод не найден');
    if (!promotion.isActive) throw invalid('Промокод неактивен');
    if (promotion.validFrom && promotion.validFrom > now) throw invalid('Срок действия промокода ещё не начался');
    if (promotion.validTo && promotion.validTo < now) throw invalid('Срок действия промокода истёк');
    if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) {
      throw invalid('Лимит использований промокода исчерпан');
    }
    if (subtotal < Number(promotion.minOrderAmount)) {
      throw invalid(`Минимальная сумма заказа для промокода — ${Number(promotion.minOrderAmount)} ₸`);
    }
  }

  private assertValidConfig(type: string, value: number, params: Record<string, unknown>): void {
    const errors = this.strategies.get(type).validateConfig(value, params);
    if (errors.length) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, errors.join('; '), undefined, { config: errors });
    }
  }

  private toResponse(p: Promotion) {
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      strategy: p.strategy,
      value: Number(p.value),
      params: p.params,
      minOrderAmount: Number(p.minOrderAmount),
      usageLimit: p.usageLimit,
      usedCount: p.usedCount,
      isActive: p.isActive,
      validFrom: p.validFrom?.toISOString() ?? null,
      validTo: p.validTo?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    };
  }
}
