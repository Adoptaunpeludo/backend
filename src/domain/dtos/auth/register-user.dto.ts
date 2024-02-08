import { ToInt, Trim } from 'class-sanitizer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { UserRoles } from '../../../interfaces/user-response.interface';

enum UserTypes {
  ADMIN = 'admin',
  SHELTER = 'shelter',
  ADOPTER = 'adopter',
}
export class RegisterUserDto {
  @IsString()
  @Trim()
  @MinLength(3, { message: 'username should be minimum of 5 characters' })
  username!: string;

  @IsEmail({}, { message: 'email should be a valid email address' })
  @Trim()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'password should be minimum of 8 characters' })
  password!: string;

  @IsString()
  @IsEnum(UserTypes)
  role!: UserRoles;

  @IsString()
  @Trim()
  dni!: string;

  @IsString()
  @Trim()
  firstName!: string;

  @IsString()
  @Trim()
  lastName!: string;

  @IsString()
  @Trim()
  phoneNumber!: string;

  @IsString()
  @Trim()
  address!: string;

  @IsOptional()
  @ToInt()
  cityId!: number;
}
