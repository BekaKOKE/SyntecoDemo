import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import type { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin' as UserRole, 'super_admin' as UserRole)
  @ApiOperation({ summary: 'List all users — admin only' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  @Roles('admin' as UserRole, 'super_admin' as UserRole)
  @ApiOperation({ summary: 'Get user by ID — admin only' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
