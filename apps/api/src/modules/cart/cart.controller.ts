import {
  Controller, Get, Post, Put, Delete, Body, Param, Headers, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, CartResponseDto } from './cart.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';

@ApiTags('Cart')
@Controller('cart')
@Public()
@UseGuards(OptionalJwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart (auth or guest via X-Session-Id header)' })
  @ApiHeader({ name: 'X-Session-Id', required: false, description: 'Guest session ID' })
  async getCart(
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(user?.id, sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart. Creates guest cart if no auth + X-Session-Id.' })
  @ApiHeader({ name: 'X-Session-Id', required: false, description: 'Guest session ID' })
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(dto.productId, dto.quantity ?? 1, user?.id, sessionId);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update item quantity. Set 0 to remove.' })
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItemQuantity(id, dto.quantity, user?.id, sessionId);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(id, user?.id, sessionId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from cart' })
  async clearCart(
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(user?.id, sessionId);
  }
}
