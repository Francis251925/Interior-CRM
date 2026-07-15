import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDealDto {
  @IsOptional()
  @IsNumber()
  estimatedBudget?: number;

  @IsOptional()
  @IsDateString()
  expectedClosureDate?: string;

  @IsOptional()
  @IsNumber()
  probability?: number;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
