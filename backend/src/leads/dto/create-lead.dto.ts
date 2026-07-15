import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { LeadSource, PropertyType } from '@prisma/client';

export class CreateLeadDto {
  @IsNotEmpty()
  customerName: string;

  @IsNotEmpty()
  mobile: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  location?: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsOptional()
  @IsNumber()
  propertySize?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsString()
  @IsNotEmpty()
  assignedToId: string;

  @IsOptional()
  notes?: string;
}
