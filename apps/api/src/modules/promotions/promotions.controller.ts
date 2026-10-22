import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto, ValidatePromoDto } from './dto/promotion.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CartService } from '../cart/cart.service';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly promotions: PromotionsService,
    private readonly cart: CartService,
  ) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check a promo code against the current cart and return the discount' })
  async validate(@CurrentUser() user: any, @Body() dto: ValidatePromoDto) {
    const cart = await this.cart.getCart(user.id);
    const items = cart.items.map(i => ({
      productId: i.productId, title: i.title, quantity: i.quantity, unitPrice: i.unitPrice,
    }));
    const subtotal = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
    return this.promotions.evaluate(dto.code, items, subtotal);
  }

  @Get('strategies')
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'List available discount strategies (admin)' })
  strategies() {
    return this.promotions.listStrategies();
  }

  @Get()
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'List promotions (admin)' })
  findAll() {
    return this.promotions.findAll();
  }

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create promotion (admin)' })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotions.create(dto);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update promotion, incl. switching its discount strategy (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotions.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Delete promotion (admin)' })
  remove(@Param('id') id: string) {
    return this.promotions.remove(id);
  }
}
