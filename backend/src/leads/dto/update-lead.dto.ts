import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LeadSource, LeadStatus, PropertyType } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional()
  customerName?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @IsNumber()
  propertySize?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  notes?: string;
}
