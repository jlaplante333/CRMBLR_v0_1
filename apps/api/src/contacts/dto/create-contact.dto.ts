import { IsString, IsOptional, IsEmail, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContactStage } from '@crmblr/types';

export class CreateContactDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Contact stage', enum: ContactStage, required: false })
  @IsOptional()
  @IsEnum(ContactStage)
  stage?: ContactStage;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  @IsObject()
  custom?: any;
}

export class UpdateContactDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Contact stage', enum: ContactStage, required: false })
  @IsOptional()
  @IsEnum(ContactStage)
  stage?: ContactStage;

  @ApiProperty({ description: 'Custom fields', required: false })
  @IsOptional()
  @IsObject()
  custom?: any;
}
