import {
  Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CrmService } from './crm.service';

@ApiTags('Admin / CRM')
@ApiBearerAuth()
@Controller('admin/crm')
@UseGuards(RolesGuard)
@Roles('admin', 'super_admin', 'manager')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('pipeline')
  @ApiOperation({ summary: 'Get full Kanban pipeline with deals grouped by stage' })
  getPipeline() {
    return this.crmService.getPipeline();
  }

  @Post('deals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new deal' })
  create(@Body() dto: any) {
    return this.crmService.create(dto);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update deal (stage change, edit, etc.)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.crmService.update(id, dto);
  }

  @Delete('deals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete deal' })
  remove(@Param('id') id: string) {
    return this.crmService.remove(id);
  }
}
