import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InquiryItemDto } from './create-inquiry.dto';

export class UpdateInquiryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ type: [InquiryItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InquiryItemDto)
  items?: InquiryItemDto[];

  @ApiPropertyOptional({ enum: ['new', 'in_progress', 'quoted', 'closed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['new', 'in_progress', 'quoted', 'closed', 'cancelled'])
  status?: 'new' | 'in_progress' | 'quoted' | 'closed' | 'cancelled';

  @ApiPropertyOptional({ enum: ['high', 'normal', 'low'] })
  @IsOptional()
  @IsEnum(['high', 'normal', 'low'])
  priority?: 'high' | 'normal' | 'low';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
