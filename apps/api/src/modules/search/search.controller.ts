import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Full-text product search — public' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (Russian text supported)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'priceMin', required: false })
  @ApiQuery({ name: 'priceMax', required: false })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  search(@Query() query: any) {
    return this.searchService.search({
      ...query,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 24,
      inStock: query.inStock === 'true',
      priceMin: query.priceMin ? parseFloat(query.priceMin) : undefined,
      priceMax: query.priceMax ? parseFloat(query.priceMax) : undefined,
    });
  }

  @Public()
  @Get('autocomplete')
  @ApiOperation({ summary: 'Search autocomplete — public' })
  @ApiQuery({ name: 'q', required: true })
  autocomplete(@Query('q') q: string) {
    return this.searchService.autocomplete(q).then(r => ({ data: r }));
  }
}
