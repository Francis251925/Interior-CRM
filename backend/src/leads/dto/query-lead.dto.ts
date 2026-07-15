import { IsOptional } from 'class-validator';

export class QueryLeadDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  source?: string;

  @IsOptional()
  assignedToId?: string;

  @IsOptional()
  propertyType?: string;

  @IsOptional()
  minBudget?: string;

  @IsOptional()
  maxBudget?: string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
