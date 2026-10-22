import { IsString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReserveStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ description: 'Quantity to reserve' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ReleaseStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ description: 'Quantity to release' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class DeductStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ description: 'Quantity to deduct (from reserved)' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class TransferStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Source warehouse ID' })
  @IsUUID()
  fromWarehouseId: string;

  @ApiProperty({ description: 'Target warehouse ID' })
  @IsUUID()
  toWarehouseId: string;

  @ApiProperty({ description: 'Quantity to transfer' })
  @IsInt()
  @Min(1)
  quantity: number;
}

// ── Response DTOs ──────────────────────────────────────

export class WarehouseStockDto {
  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  warehouseName: string;

  @ApiProperty()
  warehouseCode: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  reserved: number;

  @ApiProperty()
  available: number;
}

export class ProductStockResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  variantId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: [WarehouseStockDto] })
  warehouses: WarehouseStockDto[];

  @ApiProperty()
  totalAvailable: number;

  @ApiProperty()
  inStock: boolean;

  @ApiProperty()
  reorderPoint: number;
}

export class StockAlertDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  variantId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  warehouseName: string;

  @ApiProperty()
  available: number;

  @ApiProperty()
  reorderPoint: number;
}
