import { Trim, ToInt } from 'class-sanitizer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Trim()
  @MinLength(3)
  @IsOptional()
  username?: string;

  @IsString()
  @Trim()
  @MinLength(3)
  @IsOptional()
  firstName?: string;

  @IsString()
  @Trim()
  @MinLength(3)
  @IsOptional()
  lastName?: string;

  @IsString()
  @Trim()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @Trim()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @IsString()
  @Trim()
  @MinLength(9)
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @Trim()
  @IsOptional()
  address?: string;

  @IsOptional()
  @ToInt()
  cityId?: number;
}
