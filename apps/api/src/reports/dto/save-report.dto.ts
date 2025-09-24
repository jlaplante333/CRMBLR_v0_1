import { IsString, IsOptional } from 'class-validator';

export class SaveReportDto {
  @IsString()
  name: string;

  @IsString()
  sql: string;

  @IsOptional()
  @IsString()
  description?: string;
}
