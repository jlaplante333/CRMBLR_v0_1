import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Tenant name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tenant slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Tenant branding', required: false })
  @IsOptional()
  @IsObject()
  branding?: any;
}

export class UpdateTenantDto {
  @ApiProperty({ description: 'Tenant name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Tenant branding', required: false })
  @IsOptional()
  @IsObject()
  branding?: any;

  @ApiProperty({ description: 'Tenant settings', required: false })
  @IsOptional()
  @IsObject()
  settings?: any;
}
