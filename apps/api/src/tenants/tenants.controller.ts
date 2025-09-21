import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    return this.tenantsService.create(createTenantDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user tenants' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  async findAll(@Request() req) {
    return this.tenantsService.findAll(req.user.sub);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID' })
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tenantsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID' })
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto, @Request() req) {
    return this.tenantsService.update(id, updateTenantDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID' })
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.tenantsService.remove(id, req.user.sub);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }
}
