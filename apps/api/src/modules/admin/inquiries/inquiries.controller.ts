import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CsrfRequired } from '../../../common/guards/csrf.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryQueryDto } from './dto/inquiry-query.dto';

@ApiTags('Admin / Inquiries')
@ApiBearerAuth()
@Controller('admin/inquiries')
@UseGuards(RolesGuard)
@Roles('admin', 'super_admin', 'manager')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'KPI statistics for inquiries dashboard' })
  getStats() {
    return this.inquiriesService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'List inquiries with filters, search, pagination' })
  findAll(@Query() query: InquiryQueryDto) {
    return this.inquiriesService.findAll(query);
  }

  // ⚠️ Must be BEFORE :id — otherwise "my" is caught as a UUID param
  @Get('my')
  @Roles('admin', 'super_admin', 'manager', 'customer_admin', 'customer_buyer', 'customer_viewer')
  @ApiOperation({ summary: 'Get inquiries for the authenticated user (matched by email)' })
  getMyInquiries(@CurrentUser() user: any) {
    return this.inquiriesService.findByEmail(user.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry by ID' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create new inquiry' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update inquiry (status, items, notes, assignment)' })
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inquiry' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }

  // ── Public: submit from storefront (no auth required) ─────
  // CSRF-protected to prevent cross-site request forgery abuse
  @Post('public')
  @Public()
  @CsrfRequired()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit inquiry from storefront (public, CSRF-protected)' })
  submitPublic(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

}
