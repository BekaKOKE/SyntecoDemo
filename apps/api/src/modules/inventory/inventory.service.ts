import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { ProductStockResponseDto, WarehouseStockDto, StockAlertDto } from './dto/inventory.dto';

/**
 * InventoryService — the single source of truth for all stock operations.
 *
 * OrdersService calls reserve()/release()/releaseAll() instead of
 * manipulating product_stock rows directly.
 *
 * All write methods accept an optional `tx` parameter so callers
 * can pass a Prisma transaction client for atomicity.
 */
@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Read Operations ─────────────────────────────────

  async getWarehouses(): Promise<Array<{ id: string; name: string; code: string; address: string | null }>> {
    return this.prisma.warehouse.findMany({
      orderBy: { code: 'asc' },
      select: { id: true, name: true, code: true, address: true },
    });
  }

  /**
   * Get stock across all warehouses for a product.
   * Public-facing — returns available = quantity - reserved.
   */
  async getStock(productId: string): Promise<ProductStockResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, variantId: true, title: true },
    });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${productId} not found`);

    const stocks = await this.prisma.productStock.findMany({
      where: { productId },
      include: { warehouse: { select: { id: true, name: true, code: true } } },
    });

    const warehouses: WarehouseStockDto[] = stocks.map(s => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouse.name,
      warehouseCode: s.warehouse.code,
      quantity: s.quantity,
      reserved: s.reserved,
      available: s.quantity - s.reserved,
    }));

    const totalAvailable = warehouses.reduce((sum, w) => sum + w.available, 0);
    const reorderPoint = stocks[0]?.reorderPoint ?? 10;

    return {
      productId: product.id,
      variantId: product.variantId,
      title: product.title,
      warehouses,
      totalAvailable,
      inStock: totalAvailable > 0,
      reorderPoint,
    };
  }

  /**
   * Get stock for multiple products at once (used by cart/order validation).
   * Returns a map of productId → totalAvailable.
   */
  async getBulkAvailability(productIds: string[]): Promise<Map<string, { total: number; reserved: number; available: number }>> {
    const stocks = await this.prisma.productStock.findMany({
      where: { productId: { in: productIds } },
    });

    const map = new Map<string, { total: number; reserved: number; available: number }>();
    for (const s of stocks) {
      const prev = map.get(s.productId) || { total: 0, reserved: 0, available: 0 };
      map.set(s.productId, {
        total: prev.total + s.quantity,
        reserved: prev.reserved + s.reserved,
        available: prev.available + s.quantity - s.reserved,
      });
    }
    return map;
  }

  // ── Write Operations (internal) ──────────────────────

  /**
   * Lock stock rows for a product using SELECT ... FOR UPDATE.
   * Must be called within a transaction. Prevents concurrent reservations
   * from reading stale stock levels — eliminates TOCTOU race condition.
   */
  private async lockAndReadStocks(
    productId: string,
    client: any,
  ): Promise<Array<{ warehouseId: string; quantity: number; reserved: number }>> {
    const rows: any[] = await client.$queryRawUnsafe(
      `SELECT warehouse_id, quantity, reserved
       FROM product.product_stock
       WHERE product_id = $1::uuid
       FOR UPDATE`,
      productId,
    );
    return rows.map((r: any) => ({
      warehouseId: r.warehouse_id,
      quantity: Number(r.quantity),
      reserved: Number(r.reserved),
    }));
  }

  /**
   * Reserve stock for a product in a specific warehouse.
   * Fails if available < quantity. Uses row-level locking to prevent races.
   */
  async reserve(
    productId: string,
    warehouseId: string,
    quantity: number,
    tx?: any,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    // Use SELECT FOR UPDATE to lock the row — prevents concurrent reservation races
    const stocks = await this.lockAndReadStocks(productId, client);
    const stock = stocks.find(s => s.warehouseId === warehouseId);

    if (!stock) {
      throw new AppException(ErrorCode.STOCK_NOT_FOUND, `Stock not found for product ${productId} in warehouse ${warehouseId}`);
    }

    const available = stock.quantity - stock.reserved;
    if (available < quantity) {
      throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
        `Insufficient stock for product ${productId}. Available: ${available}, requested: ${quantity}`
      );
    }

    await client.productStock.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: { reserved: stock.reserved + quantity },
    });
  }

  /**
   * Release previously reserved stock.
   * Caps at current reserved amount (prevents negative reserved).
   */
  async release(
    productId: string,
    warehouseId: string,
    quantity: number,
    tx?: any,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    const stock = await client.productStock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    if (!stock) return;

    const toRelease = Math.min(stock.reserved, quantity);
    if (toRelease > 0) {
      await client.productStock.update({
        where: { productId_warehouseId: { productId, warehouseId } },
        data: { reserved: stock.reserved - toRelease },
      });
    }
  }

  /**
   * Deduct stock after shipment — decreases both quantity and reserved.
   * Admin-only operation.
   */
  async deduct(
    productId: string,
    warehouseId: string,
    quantity: number,
    tx?: any,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    const stock = await client.productStock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    if (!stock) {
      throw new AppException(ErrorCode.STOCK_NOT_FOUND, `Stock not found for product ${productId} in warehouse ${warehouseId}`);
    }

    if (stock.reserved < quantity) {
      throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
        `Cannot deduct ${quantity} — only ${stock.reserved} reserved. Ship the order first.`
      );
    }

    if (stock.quantity < quantity) {
      throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
        `Cannot deduct ${quantity} — only ${stock.quantity} in stock.`
      );
    }

    await client.productStock.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: {
        quantity: stock.quantity - quantity,
        reserved: stock.reserved - quantity,
      },
    });
  }

  /**
   * Transfer stock between warehouses.
   */
  async transfer(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
  ): Promise<void> {
    const fromStock = await this.prisma.productStock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } },
    });

    if (!fromStock || fromStock.quantity < quantity) {
      throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
        `Insufficient stock at source. Available: ${fromStock?.quantity ?? 0}, requested: ${quantity}`
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productStock.update({
        where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } },
        data: { quantity: fromStock.quantity - quantity },
      });

      // Upsert target — create stock row if this product doesn't exist at target warehouse yet
      const toStock = await tx.productStock.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } },
      });

      if (toStock) {
        await tx.productStock.update({
          where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } },
          data: { quantity: toStock.quantity + quantity },
        });
      } else {
        await tx.productStock.create({
          data: {
            productId,
            warehouseId: toWarehouseId,
            quantity,
            reserved: 0,
            reorderPoint: 10,
          },
        });
      }
    });
  }

  /**
   * Reserve stock intelligently across warehouses for a given product and quantity.
   * Reserves from the warehouse with the most available stock first.
   * Uses SELECT FOR UPDATE row-level locking to prevent concurrent reservation races.
   * Returns the warehouse allocation breakdown.
   */
  async reserveAcrossWarehouses(
    productId: string,
    quantity: number,
    tx?: any,
  ): Promise<{ warehouseId: string; quantity: number }[]> {
    const client = tx ?? this.prisma;

    // Lock ALL stock rows for this product — prevents TOCTOU race conditions
    const lockedStocks = await this.lockAndReadStocks(productId, client);
    // Sort by available quantity descending
    lockedStocks.sort((a, b) => (b.quantity - b.reserved) - (a.quantity - a.reserved));

    const allocations: { warehouseId: string; quantity: number }[] = [];
    let remaining = quantity;

    for (const stock of lockedStocks) {
      if (remaining <= 0) break;
      const available = stock.quantity - stock.reserved;
      const toReserve = Math.min(available, remaining);
      if (toReserve > 0) {
        await client.productStock.update({
          where: { productId_warehouseId: { productId, warehouseId: stock.warehouseId } },
          data: { reserved: stock.reserved + toReserve },
        });
        allocations.push({ warehouseId: stock.warehouseId, quantity: toReserve });
        remaining -= toReserve;
      }
    }

    if (remaining > 0) {
      throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
        `Cannot reserve ${quantity} of product ${productId}. Only ${quantity - remaining} available across all warehouses.`
      );
    }

    return allocations;
  }

  /**
   * Release all reserved stock for a product (used on order cancellation).
   * Uses row-level locking to prevent concurrent modifications.
   */
  async releaseAllReserved(productId: string, quantity: number, tx?: any): Promise<void> {
    const client = tx ?? this.prisma;
    // Lock rows to prevent concurrent reservation/release conflicts
    const lockedStocks = await this.lockAndReadStocks(productId, client);
    lockedStocks.sort((a, b) => b.reserved - a.reserved);

    let remaining = quantity;
    for (const stock of lockedStocks) {
      if (remaining <= 0) break;
      const toRelease = Math.min(stock.reserved, remaining);
      if (toRelease > 0) {
        await client.productStock.update({
          where: { productId_warehouseId: { productId, warehouseId: stock.warehouseId } },
          data: { reserved: stock.reserved - toRelease },
        });
        remaining -= toRelease;
      }
    }
  }

  // ── Alerts ───────────────────────────────────────────

  /**
   * Get all products with low stock (available <= reorderPoint).
   */
  async getLowStockAlerts(): Promise<StockAlertDto[]> {
    const stocks = await this.prisma.productStock.findMany({
      include: {
        product: { select: { id: true, variantId: true, title: true } },
        warehouse: { select: { name: true } },
      },
    });

    const alerts: StockAlertDto[] = [];
    for (const s of stocks) {
      const available = s.quantity - s.reserved;
      if (available <= s.reorderPoint) {
        alerts.push({
          productId: s.productId,
          variantId: s.product.variantId,
          title: s.product.title,
          warehouseName: s.warehouse.name,
          available,
          reorderPoint: s.reorderPoint,
        });
      }
    }

    return alerts.sort((a, b) => a.available - b.available);
  }
}
