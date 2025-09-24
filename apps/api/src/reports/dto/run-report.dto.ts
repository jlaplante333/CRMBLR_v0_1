import { IsString, IsOptional, IsObject } from 'class-validator';

export class RunReportDto {
  @IsString()
  sql: string;

  @IsOptional()
  @IsObject()
  limit?: number;
}
