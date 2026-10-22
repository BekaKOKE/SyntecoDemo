import { IsString, IsInt, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ResolvePriceQueryDto {
  @ApiPropertyOptional({ description: 'Customer ID for contract/segment pricing' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Quantity for volume tier lookup', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;
}

export class CreateTierDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Tier name: retail, wholesale, contract_1, contract_2, promo' })
  @IsString()
  tier: string;

  @ApiProperty({ description: 'Price in KZT' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Minimum quantity for this tier', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Contract ID if this is contract-specific pricing' })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsOptional()
  @IsString()
  validTo?: string;
}

// ── Response DTOs ──────────────────────────────────────

export class PriceTierDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tier: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  minQuantity: number;

  @ApiProperty()
  contractId: string | null;
}

export class ResolvedPriceDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  variantId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  tier: string;

  @ApiProperty()
  originalPrice: number;

  @ApiProperty()
  discountPercent: number;

  @ApiProperty()
  savings: number;

  @ApiProperty()
  unit: string;
}
