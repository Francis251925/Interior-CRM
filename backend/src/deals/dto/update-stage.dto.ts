import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DealStage } from '@prisma/client';

export class UpdateStageDto {
  @IsEnum(DealStage)
  stage: DealStage;

  @IsOptional()
  @IsString()
  lostReason?: string;
}
