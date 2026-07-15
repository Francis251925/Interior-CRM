import { IsOptional } from 'class-validator';

export class QueryDealDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  stage?: string;

  @IsOptional()
  assignedToId?: string;

  @IsOptional()
  propertyType?: string;

  @IsOptional()
  minBudget?: string;

  @IsOptional()
  maxBudget?: string;
}
