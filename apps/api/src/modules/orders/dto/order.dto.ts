import {
  IsString, IsInt, IsOptional, IsEnum, Min, IsArray, IsObject, MaxLength, ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum OrderStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PICKING = 'picking',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

/** Promo code + optional services — shared by quote and order creation. */
export class QuoteOrderDto {
  @ApiPropertyOptional({ example: 'SAFETY10', description: 'Promo code (selects a discount strategy)' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  promoCode?: string;

  @ApiPropertyOptional({
    example: ['express_delivery', 'cargo_insurance'],
    description: 'Optional services (GET /orders/services); each wraps the cost in a decorator',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  services?: string[];
}

export class CreateOrderDto extends QuoteOrderDto {
  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    example: 'kaspi',
    description: 'Payment method (GET /payments/methods). Default: bank_invoice',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: { phone: '+77011234567' },
    description: 'Method-specific details: phone for kaspi; cardNumber, cardExpiry, cardCvc, cardHolder for halyk_card',
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, string>;
}

export class PayOrderDto {
  @ApiProperty({ example: 'halyk_card' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: { cardNumber: '4400430000000007', cardExpiry: '12/29', cardCvc: '123', cardHolder: 'IVAN IVANOV' } })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, string>;
}

export class CancelOrderDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  reason: string;
}

export class ApproveOrderDto {
  @ApiPropertyOptional({ description: 'Approval comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class OrderFilterDto {
  @ApiPropertyOptional({ enum: OrderStatusEnum })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

// ── Response DTOs ──────────────────────────────────────

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  variantId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  brandName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  imageUrl: string | null;
}

export class OrderStatusHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderStatusEnum })
  fromStatus: string | null;

  @ApiProperty({ enum: OrderStatusEnum })
  toStatus: OrderStatusEnum;

  @ApiProperty()
  actor: string | null;

  @ApiProperty()
  comment: string | null;

  @ApiProperty()
  createdAt: string;
}

export class OrderCustomerDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string | null;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({ enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  vat: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ nullable: true })
  promoCode: string | null;

  @ApiProperty({ nullable: true })
  discountStrategy: string | null;

  @ApiProperty({ description: 'Selected services [{ code, label, amount }]' })
  services: { code: string; label: string; amount: number }[];

  @ApiProperty()
  servicesTotal: number;

  @ApiProperty({ nullable: true })
  paymentMethod: string | null;

  @ApiProperty({ enum: ['pending', 'paid', 'failed', 'refunded'] })
  paymentStatus: string;

  @ApiProperty({ description: 'Payment attempts, newest first' })
  payments: { id: string; method: string; status: string; amount: number; externalId: string | null; message: string | null; createdAt: string }[];

  @ApiPropertyOptional({ description: 'Result of the payment attempt made in this request' })
  lastPayment?: { status: string; message: string; transactionId: string | null };

  @ApiProperty({ type: OrderCustomerDto, nullable: true })
  customer: OrderCustomerDto | null;

  @ApiProperty()
  notes: string | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ type: [OrderStatusHistoryDto] })
  statusHistory: OrderStatusHistoryDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
