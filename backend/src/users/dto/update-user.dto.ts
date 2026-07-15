import { IsBoolean, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  employeeName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
