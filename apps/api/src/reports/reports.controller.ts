import { Controller, Post, Get, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { RunReportDto } from './dto/run-report.dto';
import { SaveReportDto } from './dto/save-report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate SQL from natural language' })
  @ApiResponse({ status: 200, description: 'SQL generated successfully' })
  async generateSQL(@Body() generateReportDto: GenerateReportDto, @Headers('x-tenant-id') tenantId: string) {
    return this.reportsService.generateSQL(generateReportDto, tenantId);
  }

  @Post('run')
  @ApiOperation({ summary: 'Execute SQL query' })
  @ApiResponse({ status: 200, description: 'Query executed successfully' })
  async runReport(@Body() runReportDto: RunReportDto, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.reportsService.runReport(runReportDto, tenantId, req.user.sub);
  }

  @Post('save')
  @ApiOperation({ summary: 'Save a report' })
  @ApiResponse({ status: 201, description: 'Report saved successfully' })
  async saveReport(@Body() saveReportDto: SaveReportDto, @Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.reportsService.saveReport(
      saveReportDto.name,
      saveReportDto.sql,
      saveReportDto.description,
      tenantId,
      req.user.sub
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get saved reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getSavedReports(@Headers('x-tenant-id') tenantId: string, @Request() req) {
    return this.reportsService.getSavedReports(tenantId, req.user.sub);
  }
}
