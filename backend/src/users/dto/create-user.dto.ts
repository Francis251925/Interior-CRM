import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  employeeName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  mobile: string;

  @IsEnum(Role)
  role: Role;

  @MinLength(6)
  password: string;
}
