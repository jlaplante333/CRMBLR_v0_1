import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThankYouStatus } from '@crmblr/types';

export class CreateDonationDto {
  @ApiProperty({ description: 'Contact ID', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ description: 'Organization ID', required: false })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({ description: 'Campaign ID', required: false })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiProperty({ description: 'Donation amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency', required: false, default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Donation date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Thank you status', enum: ThankYouStatus, required: false })
  @IsOptional()
  @IsEnum(ThankYouStatus)
  thankYouStatus?: ThankYouStatus;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  @IsObject()
  custom?: any;
}

export class UpdateDonationDto {
  @ApiProperty({ description: 'Contact ID', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ description: 'Organization ID', required: false })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({ description: 'Campaign ID', required: false })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiProperty({ description: 'Donation amount', required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Donation date', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Thank you status', enum: ThankYouStatus, required: false })
  @IsOptional()
  @IsEnum(ThankYouStatus)
  thankYouStatus?: ThankYouStatus;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  @IsObject()
  custom?: any;
}
