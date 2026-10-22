import { Test, TestingModule } from '@nestjs/testing';
import { AppException } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: { findUnique: jest.fn() },
      productStock: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(prisma)),
      $queryRawUnsafe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryService, { provide: PrismaClient, useValue: prisma }],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  // ── getStock ─────────────────────────────────────────
  describe('getStock', () => {
    it('should return stock for a valid product', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1', variantId: 'VAR-001', title: 'Test Product',
      });
      prisma.productStock.findMany.mockResolvedValue([
        { warehouseId: 'wh-1', warehouse: { id: 'wh-1', name: 'Almaty', code: 'ALA' }, quantity: 50, reserved: 10, reorderPoint: 10 },
        { warehouseId: 'wh-2', warehouse: { id: 'wh-2', name: 'Astana', code: 'AST' }, quantity: 30, reserved: 5, reorderPoint: 15 },
      ]);

      const result = await service.getStock('prod-1');
      expect(result.productId).toBe('prod-1');
      expect(result.totalAvailable).toBe(65); // (50-10) + (30-5)
      expect(result.inStock).toBe(true);
      expect(result.warehouses).toHaveLength(2);
      expect(result.warehouses[0].available).toBe(40);
      expect(result.warehouses[1].available).toBe(25);
      expect(result.reorderPoint).toBe(10);
    });

    it('should throw NotFoundException for missing product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.getStock('bad-id')).rejects.toThrow(AppException);
    });

    it('should return inStock=false when totalAvailable is 0', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1', variantId: 'V1', title: 'T' });
      prisma.productStock.findMany.mockResolvedValue([
        { warehouseId: 'w1', warehouse: { id: 'w1', name: 'N', code: 'N' }, quantity: 5, reserved: 5, reorderPoint: 10 },
      ]);
      const result = await service.getStock('p1');
      expect(result.totalAvailable).toBe(0);
      expect(result.inStock).toBe(false);
    });

    it('should use default reorderPoint when no stock records exist', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1', variantId: 'V1', title: 'T' });
      prisma.productStock.findMany.mockResolvedValue([]);
      const result = await service.getStock('p1');
      expect(result.reorderPoint).toBe(10);
    });
  });

  // ── getBulkAvailability ──────────────────────────────
  describe('getBulkAvailability', () => {
    it('should aggregate stock across warehouses per product', async () => {
      prisma.productStock.findMany.mockResolvedValue([
        { productId: 'p1', quantity: 50, reserved: 10 },
        { productId: 'p1', quantity: 30, reserved: 5 },
        { productId: 'p2', quantity: 100, reserved: 0 },
      ]);

      const result = await service.getBulkAvailability(['p1', 'p2']);
      expect(result.get('p1')?.available).toBe(65);
      expect(result.get('p2')?.available).toBe(100);
    });

    it('should return empty map for products with no stock', async () => {
      prisma.productStock.findMany.mockResolvedValue([]);
      const result = await service.getBulkAvailability(['p1']);
      expect(result.has('p1')).toBe(false);
    });
  });

  // ── reserve ──────────────────────────────────────────
  describe('reserve', () => {
    it('should reserve stock when available quantity is sufficient', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 50, reserved: 10 },
      ]);
      prisma.productStock.update.mockResolvedValue({});

      await service.reserve('p1', 'wh-1', 20);
      expect(prisma.productStock.update).toHaveBeenCalledWith({
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-1' } },
        data: { reserved: 30 }, // 10 + 20
      });
    });

    it('should throw when warehouse not found', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([]);
      await expect(service.reserve('p1', 'bad-wh', 10)).rejects.toThrow(AppException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 5, reserved: 0 },
      ]);
      await expect(service.reserve('p1', 'wh-1', 10)).rejects.toThrow(AppException);
    });

    it('should work with a transaction client', async () => {
      const tx = { ...prisma, $queryRawUnsafe: jest.fn().mockResolvedValue([{ warehouse_id: 'wh-1', quantity: 50, reserved: 0 }]) };
      tx.productStock = { update: jest.fn().mockResolvedValue({}) };
      await service.reserve('p1', 'wh-1', 5, tx);
      expect(tx.productStock.update).toHaveBeenCalled();
    });
  });

  // ── release ──────────────────────────────────────────
  describe('release', () => {
    it('should release reserved stock', async () => {
      prisma.productStock.findUnique.mockResolvedValue({
        productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 20,
      });
      prisma.productStock.update.mockResolvedValue({});

      await service.release('p1', 'wh-1', 15);
      expect(prisma.productStock.update).toHaveBeenCalledWith({
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-1' } },
        data: { reserved: 5 }, // 20 - 15
      });
    });

    it('should cap release at current reserved amount', async () => {
      prisma.productStock.findUnique.mockResolvedValue({
        productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 5,
      });
      prisma.productStock.update.mockResolvedValue({});

      await service.release('p1', 'wh-1', 100);
      expect(prisma.productStock.update).toHaveBeenCalledWith({
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-1' } },
        data: { reserved: 0 }, // capped at 5
      });
    });

    it('should be no-op when stock record not found', async () => {
      prisma.productStock.findUnique.mockResolvedValue(null);
      await expect(service.release('p1', 'wh-1', 10)).resolves.toBeUndefined();
      expect(prisma.productStock.update).not.toHaveBeenCalled();
    });

    it('should work with a transaction client', async () => {
      const tx = {
        productStock: {
          findUnique: jest.fn().mockResolvedValue({ productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 10 }),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      await service.release('p1', 'wh-1', 5, tx);
      expect(tx.productStock.update).toHaveBeenCalled();
    });
  });

  // ── deduct ──────────────────────────────────────────
  describe('deduct', () => {
    it('should deduct quantity and reserved after shipment', async () => {
      prisma.productStock.findUnique.mockResolvedValue({
        productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 30,
      });
      prisma.productStock.update.mockResolvedValue({});

      await service.deduct('p1', 'wh-1', 20);
      expect(prisma.productStock.update).toHaveBeenCalledWith({
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-1' } },
        data: { quantity: 30, reserved: 10 },
      });
    });

    it('should throw when reserved < quantity', async () => {
      prisma.productStock.findUnique.mockResolvedValue({
        productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 5,
      });
      await expect(service.deduct('p1', 'wh-1', 20)).rejects.toThrow(AppException);
    });

    it('should throw when quantity < requested', async () => {
      prisma.productStock.findUnique.mockResolvedValue({
        productId: 'p1', warehouseId: 'wh-1', quantity: 10, reserved: 20,
      });
      await expect(service.deduct('p1', 'wh-1', 15)).rejects.toThrow(AppException);
    });

    it('should throw when stock not found', async () => {
      prisma.productStock.findUnique.mockResolvedValue(null);
      await expect(service.deduct('p1', 'wh-1', 10)).rejects.toThrow(AppException);
    });

    it('should work with a transaction client', async () => {
      const tx = {
        productStock: {
          findUnique: jest.fn().mockResolvedValue({ productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 30 }),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      await service.deduct('p1', 'wh-1', 10, tx);
      expect(tx.productStock.update).toHaveBeenCalled();
    });
  });

  // ── transfer ─────────────────────────────────────────
  describe('transfer', () => {
    it('should transfer stock between warehouses', async () => {
      prisma.productStock.findUnique
        .mockResolvedValueOnce({ productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 10 })
        .mockResolvedValueOnce({ productId: 'p1', warehouseId: 'wh-2', quantity: 30, reserved: 5 });

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          productStock: {
            update: jest.fn().mockResolvedValue({}),
            findUnique: jest.fn().mockResolvedValue({ productId: 'p1', warehouseId: 'wh-2', quantity: 30, reserved: 5 }),
            create: jest.fn(),
          },
        };
        await cb(tx);
      });

      await service.transfer('p1', 'wh-1', 'wh-2', 10);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw when source has insufficient stock', async () => {
      prisma.productStock.findUnique.mockResolvedValue({ productId: 'p1', warehouseId: 'wh-1', quantity: 3, reserved: 0 });
      await expect(service.transfer('p1', 'wh-1', 'wh-2', 10)).rejects.toThrow(AppException);
    });

    it('should throw when source stock not found', async () => {
      prisma.productStock.findUnique.mockResolvedValue(null);
      await expect(service.transfer('p1', 'wh-1', 'wh-2', 10)).rejects.toThrow(AppException);
    });

    it('should create stock at target warehouse if it does not exist', async () => {
      prisma.productStock.findUnique.mockResolvedValue({ productId: 'p1', warehouseId: 'wh-1', quantity: 50, reserved: 0 });
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          productStock: {
            update: jest.fn().mockResolvedValue({}),
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
          },
        };
        await cb(tx);
      });
      await service.transfer('p1', 'wh-1', 'wh-new', 10);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ── reserveAcrossWarehouses ──────────────────────────
  describe('reserveAcrossWarehouses', () => {
    it('should reserve from warehouse with most stock first', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 100, reserved: 20 },
        { warehouse_id: 'wh-2', quantity: 50, reserved: 10 },
      ]);
      prisma.productStock.update.mockResolvedValue({});

      const result = await service.reserveAcrossWarehouses('p1', 80);

      // Should take from wh-1 (80 available) first, then wh-2 (40 available) if needed
      expect(result.length).toBeGreaterThanOrEqual(1);
      const totalReserved = result.reduce((s: number, a: any) => s + a.quantity, 0);
      expect(totalReserved).toBe(80);
    });

    it('should throw when total available < requested', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 10, reserved: 0 },
      ]);
      await expect(service.reserveAcrossWarehouses('p1', 20)).rejects.toThrow(AppException);
    });

    it('should work with transaction client', async () => {
      const tx = {
        $queryRawUnsafe: jest.fn().mockResolvedValue([{ warehouse_id: 'wh-1', quantity: 50, reserved: 0 }]),
        productStock: { update: jest.fn().mockResolvedValue({}) },
      };
      const result = await service.reserveAcrossWarehouses('p1', 30, tx);
      expect(result[0].warehouseId).toBe('wh-1');
      expect(result[0].quantity).toBe(30);
    });

    it('should split reservation across multiple warehouses', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 30, reserved: 0 },
        { warehouse_id: 'wh-2', quantity: 30, reserved: 0 },
      ]);
      prisma.productStock.update.mockResolvedValue({});

      const result = await service.reserveAcrossWarehouses('p1', 50);
      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(30);
      expect(result[1].quantity).toBe(20);
    });
  });

  // ── releaseAllReserved ───────────────────────────────
  describe('releaseAllReserved', () => {
    it('should release reserved stock across warehouses', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 50, reserved: 20 },
        { warehouse_id: 'wh-2', quantity: 30, reserved: 10 },
      ]);
      prisma.productStock.update.mockResolvedValue({});

      await service.releaseAllReserved('p1', 25);

      expect(prisma.productStock.update).toHaveBeenCalledTimes(2);
      // First call: wh-1, release 20 (all reserved)
      expect(prisma.productStock.update).toHaveBeenNthCalledWith(1, {
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-1' } },
        data: { reserved: 0 },
      });
      // Second call: wh-2, release remaining 5
      expect(prisma.productStock.update).toHaveBeenNthCalledWith(2, {
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-2' } },
        data: { reserved: 5 },
      });
    });

    it('should release from warehouses with most reserved first', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { warehouse_id: 'wh-1', quantity: 50, reserved: 5 },
        { warehouse_id: 'wh-2', quantity: 50, reserved: 30 },
      ]);
      prisma.productStock.update.mockResolvedValue({});

      await service.releaseAllReserved('p1', 20);
      // Should release from wh-2 first (more reserved)
      expect(prisma.productStock.update).toHaveBeenNthCalledWith(1, {
        where: { productId_warehouseId: { productId: 'p1', warehouseId: 'wh-2' } },
        data: { reserved: 10 }, // 30 - 20 = 10
      });
    });

    it('should work with transaction client', async () => {
      const tx = {
        $queryRawUnsafe: jest.fn().mockResolvedValue([{ warehouse_id: 'wh-1', quantity: 50, reserved: 30 }]),
        productStock: { update: jest.fn().mockResolvedValue({}) },
      };
      await service.releaseAllReserved('p1', 20, tx);
      expect(tx.productStock.update).toHaveBeenCalled();
    });
  });

  // ── getLowStockAlerts ────────────────────────────────
  describe('getLowStockAlerts', () => {
    it('should return products below reorder point', async () => {
      prisma.productStock.findMany.mockResolvedValue([
        {
          productId: 'p1', warehouseId: 'wh-1',
          product: { id: 'p1', variantId: 'V1', title: 'Low Stock Item' },
          warehouse: { name: 'Almaty' },
          quantity: 8, reserved: 3, reorderPoint: 10,
        },
        {
          productId: 'p2', warehouseId: 'wh-1',
          product: { id: 'p2', variantId: 'V2', title: 'Well Stocked' },
          warehouse: { name: 'Almaty' },
          quantity: 100, reserved: 0, reorderPoint: 10,
        },
      ]);

      const alerts = await service.getLowStockAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].productId).toBe('p1');
      expect(alerts[0].available).toBe(5); // 8 - 3
    });

    it('should sort alerts by available ascending', async () => {
      prisma.productStock.findMany.mockResolvedValue([
        { productId: 'p1', product: { id: 'p1', variantId: 'V1', title: 'A' }, warehouse: { name: 'W' }, quantity: 3, reserved: 0, reorderPoint: 10 },
        { productId: 'p2', product: { id: 'p2', variantId: 'V2', title: 'B' }, warehouse: { name: 'W' }, quantity: 0, reserved: 0, reorderPoint: 10 },
      ]);

      const alerts = await service.getLowStockAlerts();
      expect(alerts[0].productId).toBe('p2'); // 0 available comes first
      expect(alerts[1].productId).toBe('p1');
    });

    it('should return empty array when no products are low', async () => {
      prisma.productStock.findMany.mockResolvedValue([{
        productId: 'p1', product: { id: 'p1', variantId: 'V1', title: 'T' }, warehouse: { name: 'W' },
        quantity: 50, reserved: 0, reorderPoint: 10,
      }]);
      const alerts = await service.getLowStockAlerts();
      expect(alerts).toHaveLength(0);
    });
  });
});
