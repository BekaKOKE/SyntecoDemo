import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto, FacetsQueryDto } from './dto/product.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { UserRole } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products вЂ” public catalog endpoint' })
  findAll(@Query() filter: ProductFilterDto) {
    return this.productsService.findAll(filter);
  }

  @Public()
  @Get('facets')
  @ApiOperation({ summary: 'Get filter facets (attribute values + counts) for a scope вЂ” public' })
  getFacets(@Query() filter: FacetsQueryDto) {
    return this.productsService.getFacets(filter);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Public()
  @Get('sku/:variantId')
  @ApiOperation({ summary: 'Get product by SKU/variant ID' })
  findByVariantId(@Param('variantId') variantId: string) {
    return this.productsService.findByVariantId(variantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin' as UserRole, 'super_admin' as UserRole)
  @ApiOperation({ summary: 'Create product вЂ” admin only' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin' as UserRole, 'super_admin' as UserRole)
  @ApiOperation({ summary: 'Update product вЂ” admin only' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin' as UserRole, 'super_admin' as UserRole)
  @ApiOperation({ summary: 'Delete product вЂ” admin only' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
