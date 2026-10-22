import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CategoriesService } from './categories.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @CacheTTL(3600 * 1000) // 1 hour TTL — categories rarely change
  @ApiOperation({ summary: 'List all categories — public' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get('tree')
  @CacheTTL(3600 * 1000) // 1 hour TTL
  @ApiOperation({ summary: 'Get category tree (nested, 3 levels) — public' })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Public()
  @Get(':slug')
  @CacheTTL(3600 * 1000)
  @ApiOperation({ summary: 'Get category by slug — public' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
