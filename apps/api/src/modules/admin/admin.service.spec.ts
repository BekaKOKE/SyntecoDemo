import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { AdminService } from './admin.service';

/** Create a Prisma Decimal-like mock that works with Number() */
const dec = (n: number) => ({ toNumber: () => n, valueOf: () => n, toString: () => String(n) });

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: { count: jest.fn() },
      brand: { count: jest.fn() },
      category: { count: jest.fn() },
      order: { count: jest.fn(), aggregate: jest.fn(), findMany: jest.fn() },
      user: { count: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaClient, useValue: prisma }],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  describe('getStats', () => {
    it('should return dashboard stats', async () => {
      prisma.product.count.mockResolvedValue(1080);
      prisma.brand.count.mockResolvedValue(456);
      prisma.category.count.mockResolvedValue(19);
      prisma.order.count.mockResolvedValue(6);
      prisma.user.count.mockResolvedValue(3);
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: dec(250000) } });

      const stats = await service.getStats();
      expect(stats.productCount).toBe(1080);
      expect(stats.brandCount).toBe(456);
      expect(stats.categoryCount).toBe(19);
      expect(stats.orderCount).toBe(6);
      expect(stats.userCount).toBe(3);
      expect(stats.totalRevenue).toBe(250000);
    });

    it('should exclude cancelled and returned orders from revenue', async () => {
      prisma.product.count.mockResolvedValue(0);
      prisma.brand.count.mockResolvedValue(0);
      prisma.category.count.mockResolvedValue(0);
      prisma.order.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: dec(0) } });
      await service.getStats();
      expect(prisma.order.aggregate).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: { notIn: ['cancelled', 'returned'] } },
      }));
    });

    it('should return 0 revenue when _sum is null', async () => {
      prisma.product.count.mockResolvedValue(0);
      prisma.brand.count.mockResolvedValue(0);
      prisma.category.count.mockResolvedValue(0);
      prisma.order.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: null } });
      const stats = await service.getStats();
      expect(stats.totalRevenue).toBe(0);
    });
  });

  describe('getRecentOrders', () => {
    it('should return recent orders with default limit of 10', async () => {
      prisma.order.findMany.mockResolvedValue([
        { id: 'o1', orderNumber: 'SO-2026-00001', status: 'confirmed', total: dec(50000), createdAt: new Date() },
      ]);
      const orders = await service.getRecentOrders();
      expect(orders).toHaveLength(1);
      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
    });

    it('should respect custom limit', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      await service.getRecentOrders(5);
      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
    });

    it('should select only summary fields', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      await service.getRecentOrders();
      expect(prisma.order.findMany.mock.calls[0][0].select).toEqual({
        id: true, orderNumber: true, status: true, total: true, createdAt: true,
      });
    });
  });
});
