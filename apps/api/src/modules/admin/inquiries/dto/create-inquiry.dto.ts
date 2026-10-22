import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsEmail,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InquiryItemDto {
  @ApiProperty({ example: 'SAF-8511-N95' })
  @IsString({ message: 'Артикул обязателен' })
  @IsNotEmpty({ message: 'Артикул обязателен' })
  sku: string;

  @ApiProperty({ example: 'Респиратор 3M 8511 N95' })
  @IsString({ message: 'Название товара обязательно' })
  @IsNotEmpty({ message: 'Название товара обязательно' })
  name: string;

  @ApiProperty({ example: 100 })
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть не менее 1' })
  quantity: number;

  @ApiProperty({ example: 1840 })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  unitPrice: number;
}

export class CreateInquiryDto {
  @ApiProperty({ example: 'BI Group' })
  @IsString({ message: 'Название компании обязательно' })
  @IsNotEmpty({ message: 'Название компании обязательно' })
  companyName: string;

  @ApiProperty({ example: 'Тимуров Е.' })
  @IsString({ message: 'Контактное лицо обязательно' })
  @IsNotEmpty({ message: 'Контактное лицо обязательно' })
  contactName: string;

  @ApiProperty({ example: '+7 701 411 28 90' })
  @IsString()
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @Matches(/^(?=(?:\D*\d){11}\D*$)\+?[\d\s()-]+$/, { message: 'Укажите корректный телефон' })
  contactPhone: string;

  @ApiProperty({ example: 'timurov@bigroup.kz' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Укажите корректный email' })
  contactEmail: string;

  @ApiPropertyOptional({ type: [InquiryItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InquiryItemDto)
  items?: InquiryItemDto[];

  @ApiPropertyOptional({ enum: ['high', 'normal', 'low'], default: 'normal' })
  @IsOptional()
  @IsEnum(['high', 'normal', 'low'])
  priority?: 'high' | 'normal' | 'low';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
