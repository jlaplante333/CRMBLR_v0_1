import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ description: 'Natural language prompt for report generation' })
  @IsString()
  prompt: string;

  @ApiProperty({ description: 'Module context', required: false })
  @IsOptional()
  @IsString()
  module?: string;
}

export class RunReportDto {
  @ApiProperty({ description: 'SQL query to execute' })
  @IsString()
  sql: string;

  @ApiProperty({ description: 'Maximum number of rows to return', required: false, default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class SaveReportDto {
  @ApiProperty({ description: 'Report name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'SQL query' })
  @IsString()
  sql: string;

  @ApiProperty({ description: 'Report description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
