import { Test, TestingModule } from '@nestjs/testing';
import { AppException } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { BrandsService } from './brands.service';

describe('BrandsService', () => {
  let service: BrandsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      brand: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandsService, { provide: PrismaClient, useValue: prisma }],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  // ── findAll ──────────────────────────────────────────
  describe('findAll', () => {
    it('should return all brands with product counts', async () => {
      prisma.brand.findMany.mockResolvedValue([
        { id: 'b1', name: 'Bosch', slug: 'bosch', logoUrl: null, website: null, createdAt: new Date(), updatedAt: new Date(), _count: { products: 42 } },
        { id: 'b2', name: '3M', slug: '3m', logoUrl: null, website: 'https://3m.com', createdAt: new Date(), updatedAt: new Date(), _count: { products: 15 } },
      ]);

      const brands = await service.findAll();
      expect(brands).toHaveLength(2);
      expect(brands[0].name).toBe('Bosch');
      expect(brands[0]._count.products).toBe(42);
    });

    it('should return brands sorted by name ascending', async () => {
      prisma.brand.findMany.mockResolvedValue([]);
      await service.findAll();
      expect(prisma.brand.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } })
      );
    });

    it('should filter by search term', async () => {
      prisma.brand.findMany.mockResolvedValue([{ id: 'b1', name: 'Bosch', slug: 'bosch', logoUrl: null, website: null, createdAt: new Date(), updatedAt: new Date(), _count: { products: 42 } }]);

      const brands = await service.findAll('bosch');
      expect(brands).toHaveLength(1);
      expect(prisma.brand.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'bosch', mode: 'insensitive' } },
        })
      );
    });

    it('should not filter when search is empty', async () => {
      prisma.brand.findMany.mockResolvedValue([]);
      await service.findAll('');
      expect(prisma.brand.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined })
      );
    });

    it('should return empty array when no brands exist', async () => {
      prisma.brand.findMany.mockResolvedValue([]);
      const brands = await service.findAll();
      expect(brands).toHaveLength(0);
    });
  });

  // ── create ───────────────────────────────────────────
  describe('create', () => {
    it('should create a brand with generated slug', async () => {
      prisma.brand.findUnique.mockResolvedValue(null); // no existing brand
      prisma.brand.create.mockResolvedValue({
        id: 'new-brand', name: 'Makita', slug: 'makita-abc123', website: null,
        logoUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.create({ name: 'Makita' });
      expect(result.name).toBe('Makita');
      expect(result.slug).toMatch(/^makita-[a-z0-9]{6}$/);
      expect(prisma.brand.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Makita' }),
        })
      );
    });

    it('should throw ConflictException when brand name exists', async () => {
      prisma.brand.findUnique.mockResolvedValue({ id: 'existing', name: 'Bosch' });
      await expect(service.create({ name: 'Bosch' })).rejects.toThrow(AppException);
    });

    it('should generate URL-safe slugs from Cyrillic names', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);
      prisma.brand.create.mockResolvedValue({
        id: 'b', name: 'Энергия', slug: 'энергия-xyz789', website: null,
        logoUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await service.create({ name: 'Энергия' });
      const call = prisma.brand.create.mock.calls[0][0];
      // Slug keeps Cyrillic chars (they are valid in modern URLs) and appends random suffix
      expect(call.data.slug).toMatch(/^энергия-[a-z0-9]{6}$/);
    });

    it('should handle special characters in brand names', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);
      prisma.brand.create.mockResolvedValue({
        id: 'b', name: 'A&B Tools', slug: 'a-b-tools-123abc', website: null,
        logoUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await service.create({ name: 'A&B Tools' });
      const call = prisma.brand.create.mock.calls[0][0];
      // Slug should not contain & or spaces
      expect(call.data.slug).not.toContain('&');
      expect(call.data.slug).not.toContain(' ');
    });

    it('should store website URL when provided', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);
      prisma.brand.create.mockResolvedValue({
        id: 'b', name: 'Siemens', slug: 'siemens-a1b2c3', website: 'https://siemens.com',
        logoUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.create({ name: 'Siemens', website: 'https://siemens.com' });
      expect(prisma.brand.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ website: 'https://siemens.com' }),
        })
      );
    });
  });
});
