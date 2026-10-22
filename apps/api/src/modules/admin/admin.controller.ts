import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin', 'super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300 * 1000) // 5 min — dashboard stats
  getStats() {
    return this.adminService.getStats();
  }

  @Get('recent-orders')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 1000) // 1 min — recent orders change more often
  getRecentOrders() {
    return this.adminService.getRecentOrders(10);
  }
}
