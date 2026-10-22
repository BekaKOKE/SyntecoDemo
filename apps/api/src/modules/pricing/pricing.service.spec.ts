import { Test, TestingModule } from '@nestjs/testing';
import { AppException } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { PricingService } from './pricing.service';

/** Create a Prisma Decimal-like mock that works with Number() */
const dec = (n: number) => ({ toNumber: () => n, valueOf: () => n, toString: () => String(n) });

describe('PricingService', () => {
  let service: PricingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: { findUnique: jest.fn() },
      productPrice: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      company: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService, { provide: PrismaClient, useValue: prisma }],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  describe('resolvePrice', () => {
    const product = { id: 'p1', price: dec(1000), salePrice: dec(800) };

    it('should return retail price when no customer and no tiers', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.productPrice.findFirst.mockResolvedValue(null);
      const result = await service.resolvePrice('p1');
      expect(result.tier).toBe('retail');
      expect(result.price).toBe(800);
      expect(result.originalPrice).toBe(800);
      expect(result.discountPercent).toBe(0);
      expect(result.savings).toBe(0);
    });

    it('should use product price when no salePrice', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1', price: dec(1000), salePrice: null });
      prisma.productPrice.findFirst.mockResolvedValue(null);
      const result = await service.resolvePrice('p1');
      expect(result.price).toBe(1000);
    });

    it('should throw NotFoundException for missing product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.resolvePrice('bad-id')).rejects.toThrow(AppException);
    });

    it('should resolve contract price for customer with contract', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.company.findFirst.mockResolvedValue({ contractId: 'contract-1' });
      prisma.productPrice.findFirst
        .mockResolvedValueOnce({ price: dec(700), tier: 'contract' })
        .mockResolvedValueOnce(null);
      const result = await service.resolvePrice('p1', 'customer-1', 10);
      expect(result.tier).toBe('contract');
      expect(result.price).toBe(700);
      expect(result.originalPrice).toBe(800);
      expect(result.savings).toBe(100);
    });

    it('should fall back to volume tier when no contract price found', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.company.findFirst.mockResolvedValue({ contractId: 'c1' });
      prisma.productPrice.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ price: dec(750), tier: 'wholesale_10' });
      const result = await service.resolvePrice('p1', 'customer-1', 15);
      expect(result.tier).toBe('wholesale_10');
      expect(result.price).toBe(750);
    });

    it('should use volume tier when no customer provided', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.productPrice.findFirst.mockResolvedValue({ price: dec(720), tier: 'wholesale_50' });
      const result = await service.resolvePrice('p1', undefined, 60);
      expect(result.tier).toBe('wholesale_50');
      expect(result.price).toBe(720);
    });

    it('should select best volume tier for quantity', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.productPrice.findFirst.mockResolvedValue({ price: dec(650), tier: 'wholesale_100' });
      const result = await service.resolvePrice('p1', undefined, 200);
      expect(result.price).toBe(650);
    });

    it('should return retail when no tiers match quantity', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.productPrice.findFirst.mockResolvedValue(null);
      const result = await service.resolvePrice('p1', undefined, 1);
      expect(result.tier).toBe('retail');
      expect(result.price).toBe(800);
    });

    it('should calculate discount percent correctly', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1', price: dec(1000), salePrice: null });
      prisma.productPrice.findFirst.mockResolvedValue({ price: dec(800), tier: 'wholesale_10' });
      const result = await service.resolvePrice('p1', undefined, 20);
      expect(result.discountPercent).toBe(20);
    });

    it('should handle customer without a contract', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.company.findFirst.mockResolvedValue({ contractId: null });
      prisma.productPrice.findFirst.mockResolvedValue({ price: dec(750), tier: 'wholesale_10' });
      const result = await service.resolvePrice('p1', 'customer-no-contract', 15);
      expect(result.tier).toBe('wholesale_10');
    });

    it('should handle customer not linked to any company', async () => {
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.company.findFirst.mockResolvedValue(null);
      prisma.productPrice.findFirst.mockResolvedValue({ price: dec(750), tier: 'wholesale_10' });
      const result = await service.resolvePrice('p1', 'orphan-customer', 15);
      expect(result.tier).toBe('wholesale_10');
    });
  });

  describe('resolvePriceEnriched', () => {
    it('should return enriched price with product info', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1', variantId: 'VAR-001', title: 'Test Product', price: dec(1000), salePrice: null,
      });
      prisma.productPrice.findFirst.mockResolvedValue(null);
      const result = await service.resolvePriceEnriched('p1');
      expect(result.productId).toBe('p1');
      expect(result.variantId).toBe('VAR-001');
      expect(result.title).toBe('Test Product');
      expect(result.unit).toBe('KZT');
      expect(result.price).toBe(1000);
    });

    it('should throw NotFoundException for missing product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.resolvePriceEnriched('bad-id')).rejects.toThrow(AppException);
    });
  });

  describe('getTiers', () => {
    it('should return all price tiers for a product', async () => {
      prisma.productPrice.findMany.mockResolvedValue([
        { id: 't1', tier: 'retail', price: dec(1000), minQuantity: 1, contractId: null },
        { id: 't2', tier: 'wholesale_10', price: dec(950), minQuantity: 10, contractId: null },
        { id: 't3', tier: 'wholesale_50', price: dec(880), minQuantity: 50, contractId: null },
      ]);
      const tiers = await service.getTiers('p1');
      expect(tiers).toHaveLength(3);
      expect(tiers[0].price).toBe(1000);
      expect(tiers[2].price).toBe(880);
    });
  });

  describe('upsertTier', () => {
    it('should create a new price tier', async () => {
      prisma.productPrice.findFirst.mockResolvedValue(null);
      prisma.productPrice.create.mockResolvedValue({ id: 't1', price: dec(700) });
      const dto = { productId: 'p1', tier: 'promo', price: 700, minQuantity: 1 };
      await service.upsertTier(dto);
      expect(prisma.productPrice.create).toHaveBeenCalled();
    });

    it('should update existing tier when found', async () => {
      prisma.productPrice.findFirst.mockResolvedValue({ id: 'existing' });
      prisma.productPrice.update.mockResolvedValue({});
      const dto = { productId: 'p1', tier: 'wholesale_10', price: 900, minQuantity: 10 };
      await service.upsertTier(dto);
      expect(prisma.productPrice.update).toHaveBeenCalled();
    });

    it('should handle null contractId', async () => {
      prisma.productPrice.findFirst.mockResolvedValue(null);
      prisma.productPrice.create.mockResolvedValue({});
      const dto = { productId: 'p1', tier: 'retail', price: 1000 };
      await service.upsertTier(dto);
      expect(prisma.productPrice.create.mock.calls[0][0].data.contractId).toBeNull();
    });
  });

  describe('seedVolumeTiers', () => {
    it('should be no-op when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await service.seedVolumeTiers('bad-id');
      expect(prisma.productPrice.create).not.toHaveBeenCalled();
    });

    it('should create 4 volume tiers', async () => {
      prisma.product.findUnique.mockResolvedValue({ price: dec(10000) });
      prisma.productPrice.findFirst.mockResolvedValue(null);
      prisma.productPrice.create.mockResolvedValue({});
      await service.seedVolumeTiers('p1');
      expect(prisma.productPrice.create).toHaveBeenCalledTimes(4);
      const calls = prisma.productPrice.create.mock.calls;
      expect(calls[0][0].data.price).toBe(9500); // 5% off
      expect(calls[1][0].data.price).toBe(8800); // 12% off
      expect(calls[2][0].data.price).toBe(8200); // 18% off
      expect(calls[3][0].data.price).toBe(7500); // 25% off
    });
  });
});
