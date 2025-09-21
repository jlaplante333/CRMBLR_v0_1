import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TenantGuard } from '../common/guards/tenant.guard';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@ApiTags('donations')
@Controller('donations')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID' })
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new donation' })
  @ApiResponse({ status: 201, description: 'Donation created successfully' })
  async create(@Body() createDonationDto: CreateDonationDto, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.donationsService.create(createDonationDto, tenantId, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all donations' })
  @ApiResponse({ status: 200, description: 'Donations retrieved successfully' })
  async findAll(@Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.donationsService.findAll(tenantId, req.user.sub);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get donation KPIs' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKPIs(@Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.donationsService.getKPIs(tenantId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donation by ID' })
  @ApiResponse({ status: 200, description: 'Donation retrieved successfully' })
  async findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.donationsService.findOne(id, tenantId, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update donation' })
  @ApiResponse({ status: 200, description: 'Donation updated successfully' })
  async update(@Param('id') id: string, @Body() updateDonationDto: UpdateDonationDto, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.donationsService.update(id, updateDonationDto, tenantId, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete donation' })
  @ApiResponse({ status: 200, description: 'Donation deleted successfully' })
  async remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.donationsService.remove(id, tenantId, req.user.sub);
  }
}
