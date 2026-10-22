import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { ResolvePriceQueryDto, CreateTierDto, ResolvedPriceDto, PriceTierDto } from './dto/pricing.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('resolve/:productId')
  @Public()
  @ApiOperation({ summary: 'Resolve effective price. Supports customer contract + volume tiers.' })
  async resolvePrice(
    @Param('productId') productId: string,
    @Query() query: ResolvePriceQueryDto,
  ): Promise<ResolvedPriceDto> {
    return this.pricingService.resolvePriceEnriched(
      productId,
      query.customerId,
      query.quantity ?? 1,
    );
  }

  @Get('tiers/:productId')
  @Public()
  @ApiOperation({ summary: 'Get all price tiers for a product' })
  async getTiers(@Param('productId') productId: string): Promise<PriceTierDto[]> {
    return this.pricingService.getTiers(productId);
  }

  @Post('admin/tiers')
  @ApiBearerAuth()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create or update a price tier (admin only)' })
  async upsertTier(@Body() dto: CreateTierDto) {
    return this.pricingService.upsertTier(dto);
  }
}
