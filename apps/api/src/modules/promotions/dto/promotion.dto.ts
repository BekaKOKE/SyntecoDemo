import {
  IsBoolean, IsDateString, IsInt, IsNumber, IsObject, IsOptional, IsString,
  Matches, MaxLength, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ example: 'SAFETY10', description: 'Promo code (A–Z, 0–9, _ or -)' })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{3,40}$/, { message: 'Код: 3–40 символов, латиница, цифры, _ или -' })
  code: string;

  @ApiProperty({ example: 'Скидка 10% на СИЗ' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'percentage', description: 'Discount strategy type (GET /promotions/strategies)' })
  @IsString()
  strategy: string;

  @ApiProperty({ example: 10, description: 'Main parameter: percent or amount, depends on strategy' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: { maxDiscount: 50000 } })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 20000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

export class ValidatePromoDto {
  @ApiProperty({ example: 'SAFETY10' })
  @IsString()
  @MaxLength(40)
  code: string;
}

export interface AppliedDiscount {
  promotionId: string | null;
  code: string | null;
  strategy: string | null;
  amount: number;
  description: string | null;
}
