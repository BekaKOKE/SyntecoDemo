import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto, CancelOrderDto, ApproveOrderDto, OrderFilterDto,
  OrderResponseDto, OrderListResponseDto, QuoteOrderDto, PayOrderDto,
} from './dto/order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { listOrderServices } from './order-cost/order-services.catalog';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order from cart. Clears cart on success.' })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(user.id, dto);
  }

  @Post('quote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview totals for the current cart: promo discount, services, VAT' })
  async quote(@CurrentUser() user: any, @Body() dto: QuoteOrderDto) {
    return this.ordersService.quote(user.id, dto);
  }

  @Get('services')
  @Public()
  @ApiOperation({ summary: 'Optional order services (decorators) available at checkout' })
  services() {
    return listOrderServices();
  }

  @Get()
  @ApiOperation({ summary: 'List orders. Users see own orders, admins see all.' })
  async findAll(
    @CurrentUser() user: any,
    @Query() filter: OrderFilterDto,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.findAll(user.id, user.role, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID with items and status history' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findById(id, user.id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order. Releases stock reservation.' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancel(id, user.id, dto);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay or retry payment for an order through a payment gateway' })
  async pay(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: PayOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.pay(id, user.id, dto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'Approve order (B2B workflow). Admin/manager only.' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ApproveOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.approve(id, user.id, dto);
  }

  @Post(':id/transition')
  @HttpCode(HttpStatus.OK)
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'Advance order to next status (admin only)' })
  async transition(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { status: OrderStatus; comment?: string },
  ): Promise<OrderResponseDto> {
    return this.ordersService.transitionStatus(id, user.id, body.status, body.comment);
  }

  @Get(':id/transitions')
  @Roles('super_admin', 'admin', 'manager')
  @ApiOperation({ summary: 'Get valid next statuses for an order' })
  async getTransitions(@Param('id') id: string) {
    const order = await this.ordersService.findByIdAdmin(id);
    return {
      current: order.status,
      allowed: this.ordersService.getValidTransitions(order.status as OrderStatus),
    };
  }
}
