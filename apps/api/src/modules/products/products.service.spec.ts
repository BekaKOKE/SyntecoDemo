import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from './products.service';
import { TypesenseService } from '../search/typesense.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;
  let typesense: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      brand: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      category: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      productStock: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
      warehouse: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
    typesense = {
      indexProduct: jest.fn().mockResolvedValue(undefined),
      removeProduct: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaClient, useValue: prisma },
        { provide: TypesenseService, useValue: typesense },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  function getBaseWhere() {
    const call = prisma.product.findMany.mock.calls[0][0];
    return call.where.AND[0];
  }

  // ── findAll — brandSlug filter ───────────────────────
  describe('findAll — brandSlug filter', () => {
    it('should resolve brandSlug to brandId', async () => {
      prisma.brand.findUnique.mockResolvedValue({ id: 'brand-uuid', slug: 'honeywell' });

      await service.findAll({ brandSlug: 'honeywell' } as any);

      expect(prisma.brand.findUnique).toHaveBeenCalledWith({ where: { slug: 'honeywell' } });
      expect(getBaseWhere()).toEqual(expect.objectContaining({ brandId: 'brand-uuid' }));
    });

    it('should throw BRAND_NOT_FOUND when brandSlug does not exist', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);

      await expect(service.findAll({ brandSlug: 'nonexistent' } as any)).rejects.toThrow();
    });
  });

  // ── findAll — price filter ───────────────────────────
  describe('findAll — price filter', () => {
    it('should apply minPrice and maxPrice', async () => {
      await service.findAll({ minPrice: 1000, maxPrice: 50000 } as any);

      expect(getBaseWhere()).toEqual(expect.objectContaining({
        price: { gte: 1000, lte: 50000 },
      }));
    });

    it('should apply only minPrice when maxPrice is absent', async () => {
      await service.findAll({ minPrice: 1000 } as any);

      expect(getBaseWhere().price).toEqual({ gte: 1000 });
    });
  });

  // ── findAll — attributes filter ──────────────────────
  describe('findAll — attributes filter', () => {
    it('should parse attributes JSON and apply JSONB filter', async () => {
      await service.findAll({
        attributes: JSON.stringify({ 'Класс защиты': 'FFP3' }),
      } as any);

      expect(getBaseWhere().AND).toEqual(
        expect.arrayContaining([
          { attributes: { path: ['Класс защиты'], equals: 'FFP3' } },
        ]),
      );
    });

    it('should handle multiple attributes', async () => {
      await service.findAll({
        attributes: JSON.stringify({ 'Класс защиты': 'FFP3', 'Размер': 'L' }),
      } as any);

      expect(getBaseWhere().AND).toEqual(
        expect.arrayContaining([
          { attributes: { path: ['Класс защиты'], equals: 'FFP3' } },
          { attributes: { path: ['Размер'], equals: 'L' } },
        ]),
      );
    });

    it('should ignore invalid attributes JSON', async () => {
      await service.findAll({ attributes: 'not-valid-json' } as any);
      expect(getBaseWhere().AND).toBeUndefined();
    });
  });

  describe('findAll - category subtree filter', () => {
    it('should include descendants when filtering by category', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'cat-root',
        slug: 'bezopasnost',
        path: 'bezopasnost',
      });
      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-root' },
        { id: 'cat-child' },
      ]);

      await service.findAll({ categoryId: 'cat-root' } as any);

      expect(getBaseWhere().categories).toEqual({
        some: { categoryId: { in: ['cat-root', 'cat-child'] } },
      });
    });

    it('should resolve categorySlug and include descendants', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'cat-root',
        slug: 'instrumenty',
        path: 'instrumenty',
      });
      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-root' },
        { id: 'cat-child' },
      ]);

      await service.findAll({ categorySlug: 'instrumenty' } as any);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'instrumenty' },
        select: { id: true, slug: true, path: true },
      });
      expect(getBaseWhere().categories).toEqual({
        some: { categoryId: { in: ['cat-root', 'cat-child'] } },
      });
    });

    it('should reject an unknown categorySlug', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findAll({ categorySlug: 'missing' } as any)).rejects.toThrow();
    });
  });

  // ── findAll — inStockOnly filter ─────────────────────
  describe('findAll — inStockOnly filter', () => {
    it('should filter by stock > 0 when inStockOnly is true', async () => {
      await service.findAll({ inStockOnly: true } as any);

      expect(getBaseWhere()).toEqual(expect.objectContaining({
        stock: { some: { quantity: { gt: 0 } } },
      }));
    });
  });

  // ── findAll — warehouseId filter ─────────────────────
  describe('findAll — warehouseId filter', () => {
    it('should filter by warehouse', async () => {
      await service.findAll({ warehouseId: 'wh-ala' } as any);

      expect(getBaseWhere()).toEqual(expect.objectContaining({
        stock: { some: { warehouseId: 'wh-ala' } },
      }));
    });
  });

  // ── getFacets ────────────────────────────────────────
  describe('getFacets', () => {
    it('should return price range, attributes, and warehouses with counts', async () => {
      prisma.brand.findUnique.mockResolvedValue({ id: 'brand-uuid', slug: '3m' });
      prisma.product.aggregate.mockResolvedValue({ _min: { price: 450 }, _max: { price: 287000 } });
      prisma.$queryRaw.mockResolvedValue([
        { key: 'Класс защиты', value: 'FFP1', count: 12n },
        { key: 'Класс защиты', value: 'FFP2', count: 34n },
        { key: 'Класс защиты', value: 'FFP3', count: 47n },
        { key: 'Размер', value: 'S', count: 8n },
        { key: 'Размер', value: 'M', count: 15n },
      ]);
      prisma.productStock.groupBy.mockResolvedValue([
        { warehouseId: 'wh-1', _count: { _all: 156 } },
        { warehouseId: 'wh-2', _count: { _all: 89 } },
      ]);
      prisma.warehouse.findMany.mockResolvedValue([
        { id: 'wh-1', name: 'Алматы' },
        { id: 'wh-2', name: 'Астана' },
      ]);

      const result = await service.getFacets({ brandSlug: '3m' } as any);

      expect(result.priceRange).toEqual({ min: 450, max: 287000 });
      expect(result.attributes).toHaveLength(2);
      expect(result.attributes[0].name).toBe('Класс защиты');
      expect(result.attributes[0].values).toHaveLength(3);
      // Values should be sorted by count desc — FFP3 (47) first
      expect(result.attributes[0].values[0]).toEqual({ value: 'FFP3', count: 47 });
      expect(result.warehouses).toHaveLength(2);
    });

    it('should return empty arrays when brand has no products', async () => {
      prisma.brand.findUnique.mockResolvedValue({ id: 'empty-brand', slug: 'empty' });
      prisma.product.aggregate.mockResolvedValue({ _min: { price: null }, _max: { price: null } });
      prisma.$queryRaw.mockResolvedValue([]);
      prisma.productStock.groupBy.mockResolvedValue([]);
      prisma.warehouse.findMany.mockResolvedValue([]);

      const result = await service.getFacets({ brandSlug: 'empty' } as any);

      expect(result.priceRange).toEqual({ min: 0, max: 0 });
      expect(result.attributes).toEqual([]);
      expect(result.warehouses).toEqual([]);
    });

    it('should throw BRAND_NOT_FOUND when brandSlug does not exist', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);
      await expect(service.getFacets({ brandSlug: 'nope' } as any)).rejects.toThrow();
    });

    it('should use the root category path for curated facets in nested categories', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: 'cat-nested',
        slug: 'respirators',
        path: 'bezopasnost.siz.respirators',
      });
      prisma.category.findMany.mockResolvedValue([{ id: 'cat-nested' }]);
      prisma.product.aggregate.mockResolvedValue({ _min: { price: 10 }, _max: { price: 100 } });
      prisma.$queryRaw.mockResolvedValue([
        { key: 'PPE Category', value: 'Respirators', count: 9n },
        { key: 'PPE Category', value: 'Eye Protection', count: 3n },
        { key: 'Custom Spec', value: 'A', count: 2n },
        { key: 'Custom Spec', value: 'B', count: 1n },
      ]);
      prisma.productStock.groupBy.mockResolvedValue([]);
      prisma.warehouse.findMany.mockResolvedValue([]);

      const result = await service.getFacets({ categoryId: 'cat-nested' } as any);

      expect(result.attributes).toHaveLength(2);
      expect(result.attributes[0].name).toBe('PPE Category');
      expect(result.attributes[0].priority).toBe(true);
      expect(result.attributes[0].values[0]).toEqual({ value: 'Respirators', count: 9 });
      expect(result.attributes[1].name).toBe('Custom Spec');
      expect(result.attributes[1].priority).toBe(false);
    });
  });
});
