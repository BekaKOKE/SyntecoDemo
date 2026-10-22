import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { DeductStockDto, TransferStockDto, ProductStockResponseDto, StockAlertDto } from './dto/inventory.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // IMPORTANT: static routes must come before :productId param route

  @Get('warehouses')
  @ApiBearerAuth()
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'Get warehouses for stock management' })
  async getWarehouses(): Promise<Array<{ id: string; name: string; code: string; address: string | null }>> {
    return this.inventoryService.getWarehouses();
  }

  @Get('alerts/low-stock')
  @ApiBearerAuth()
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'Get all products with low stock (admin/manager only)' })
  async getLowStockAlerts(): Promise<StockAlertDto[]> {
    return this.inventoryService.getLowStockAlerts();
  }

  @Get(':productId')
  @Public()
  @ApiOperation({ summary: 'Get stock across all warehouses for a product' })
  async getStock(@Param('productId') productId: string): Promise<ProductStockResponseDto> {
    return this.inventoryService.getStock(productId);
  }

  @Post('deduct')
  @ApiBearerAuth()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Deduct stock after shipment (admin only)' })
  async deduct(@Body() dto: DeductStockDto): Promise<{ success: boolean }> {
    await this.inventoryService.deduct(dto.productId, dto.warehouseId, dto.quantity);
    return { success: true };
  }

  @Post('transfer')
  @ApiBearerAuth()
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  async transfer(@Body() dto: TransferStockDto): Promise<{ success: boolean }> {
    await this.inventoryService.transfer(
      dto.productId, dto.fromWarehouseId, dto.toWarehouseId, dto.quantity,
    );
    return { success: true };
  }
}
