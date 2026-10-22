import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { SearchService } from './search.service';
import { TypesenseService } from './typesense.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: any;
  let typesense: any;

  beforeEach(async () => {
    prisma = {
      product: { findMany: jest.fn(), count: jest.fn() },
    };

    // By default, Typesense is unavailable — tests the PG fallback path
    typesense = {
      isAvailable: jest.fn().mockReturnValue(false),
      search: jest.fn(),
      autocomplete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaClient, useValue: prisma },
        { provide: TypesenseService, useValue: typesense },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  // ── search (PG fallback path) ────────────────────────
  describe('search', () => {
    it('should search products via PostgreSQL with word matching', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', variantId: 'V1', title: 'Bosch Drill', price: { toNumber: () => 50000 }, brand: { id: 'b1', name: 'Bosch', slug: 'bosch' }, prices: [{ price: { toNumber: () => 50000 } }], images: [] },
      ]);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.search({ q: 'bosch' });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].title).toBe('Bosch Drill');
    });

    it('should return empty results for no matches', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const result = await service.search({ q: 'nonexistent_xyz' });
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should filter by brandId', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'tool', brandId: 'brand-1' });
      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.where.brandId).toBe('brand-1');
    });

    it('should filter by categoryId', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'tool', categoryId: 'cat-1' });
      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.where.categories).toEqual({ some: { categoryId: 'cat-1' } });
    });

    it('should filter by price range', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'tool', priceMin: 1000, priceMax: 50000 });
      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.where.price).toEqual({ gte: 1000, lte: 50000 });
    });

    it('should filter by in-stock only', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'tool', inStock: true });
      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.where.availability).toBe('in_stock');
    });

    it('should use relevance ordering when query provided', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'drill' });
      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual({
        _relevance: { fields: ['title'], search: 'drill', sort: 'desc' },
      });
    });

    it('should convert a multi-word query to valid PostgreSQL tsquery syntax', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'Twist Drill' });
      const call = prisma.product.findMany.mock.calls[0][0];

      expect(call.orderBy).toEqual({
        _relevance: { fields: ['title'], search: 'twist | drill', sort: 'desc' },
      });
    });

    it('should sanitize punctuation in an industrial product title before relevance ordering', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'Screw Machine Drill Bit: 41/64", 118° Point, HSS' });
      const call = prisma.product.findMany.mock.calls[0][0];

      expect(call.orderBy).toEqual({
        _relevance: {
          fields: ['title'],
          search: 'screw | machine | drill | bit | 41 | 64 | 118 | point | hss',
          sort: 'desc',
        },
      });
    });

    it('should require every meaningful token within a query variant', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'Twist Drill' });
      const call = prisma.product.findMany.mock.calls[0][0];
      const variant = call.where.OR[0];

      expect(variant.AND).toHaveLength(2);
      expect(variant.AND[0].OR[0]).toEqual({
        title: { contains: 'twist', mode: 'insensitive' },
      });
      expect(variant.AND[1].OR[0]).toEqual({
        title: { contains: 'drill', mode: 'insensitive' },
      });
    });

    it('should deduplicate repeated words and ignore one-character noise', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({
        q: "Military/Tactical Boot: Military/Tactical Boot Footwear, Men's, 10 Size, E, 8 in Boot Ht, 1 PR",
      });
      const call = prisma.product.findMany.mock.calls[0][0];
      const tokens = call.where.OR[0].AND.map((condition: any) => condition.OR[0].title.contains);

      expect(tokens).toEqual([
        'military', 'tactical', 'boot', 'footwear', 'men', '10', 'size', 'in', 'ht', 'pr',
      ]);
    });

    it('should keep Russian and translated English queries as alternatives', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: 'перчатки нитриловые' });
      const call = prisma.product.findMany.mock.calls[0][0];

      expect(call.where.OR).toHaveLength(2);
      expect(call.where.OR[0].AND).toHaveLength(2);
      expect(call.where.OR[1].AND).toHaveLength(2);
      expect(call.where.OR[1].AND[0].OR[0]).toEqual({
        title: { contains: 'gloves', mode: 'insensitive' },
      });
    });

    it('should fall back to a safe sort field for unsupported sortBy values', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: '', sortBy: 'notARealField' });
      const call = prisma.product.findMany.mock.calls[0][0];

      expect(call.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('should use sortBy when no query provided', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.search({ q: '', sortBy: 'price' });
      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual({ price: 'desc' });
    });

    it('should paginate results', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(100);

      const result = await service.search({ q: 'bolt', page: 3, limit: 10 });
      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(10);
    });

    // ── Typesense path ──────────────────────────
    it('should use Typesense when available and query ≥ 2 chars', async () => {
      typesense.isAvailable.mockReturnValue(true);
      typesense.search.mockResolvedValue({
        data: [{ id: 'p1', title: 'Found via TS' }],
        meta: { page: 1, limit: 24, total: 1, totalPages: 1 },
      });

      const result = await service.search({ q: 'bo' });
      expect(result.data[0].title).toBe('Found via TS');
    });

    it('should fall back to PG when Typesense returns empty', async () => {
      typesense.isAvailable.mockReturnValue(true);
      typesense.search.mockResolvedValue({ data: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } });
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const result = await service.search({ q: 'rareterm' });
      expect(result.data).toHaveLength(0);
    });

    it('should skip Typesense for queries < 2 characters', async () => {
      typesense.isAvailable.mockReturnValue(true);
      prisma.product.findMany.mockResolvedValue([{ id: 'p1', title: 'T', brand: { id: 'b1', name: 'B', slug: 'b' }, prices: [], images: [] }]);
      prisma.product.count.mockResolvedValue(1);

      await service.search({ q: 'a' });
      expect(typesense.search).not.toHaveBeenCalled();
    });

    it('should handle null/undefined query gracefully', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const result = await service.search({ q: '' });
      expect(result.data).toHaveLength(0);
    });
  });

  // ── autocomplete (PG only — Typesense has its own) ───
  describe('autocomplete', () => {
    it('should return matching products for autocomplete', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', variantId: 'VAR-001', title: 'Bosch Professional Drill', brand: { name: 'Bosch' }, price: { toNumber: () => 50000 } },
      ]);

      const results = await service.autocomplete('bosch');
      expect(results).toHaveLength(1);
      expect(results[0].brandName).toBe('Bosch');
      expect(results[0].title).toBe('Bosch Professional Drill');
      expect(results[0].variantId).toBe('VAR-001');
    });

    it('should return empty array for short queries', async () => {
      const results = await service.autocomplete('b');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty query', async () => {
      const results = await service.autocomplete('');
      expect(results).toHaveLength(0);
    });

    it('should respect the limit parameter', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      await service.autocomplete('drill', 3);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 3 })
      );
    });
  });
});
