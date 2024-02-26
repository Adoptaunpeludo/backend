import { Trim } from 'class-sanitizer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { facilities, legalForms } from '../../interfaces';
import { Transform, Type } from 'class-transformer';

enum enumLegalForms {
  A = 'association',
  PUA = 'public_utility_association',
  AF = 'autonomous_foundation',
  NF = 'national_foundation',
  O = 'other',
}

enum enumFacilities {
  FH = 'foster_homes',
  MOPF = 'municipal_or_public_facilities',
  LF = 'leased_facilities',
  OF = 'owned_facilities',
  PR = 'private_residences',
}

/**
 * DTO (Data Transfer Object) for updating user.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(9)
  dni?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(9)
  cif?: string;

  @IsOptional()
  @Trim()
  @IsEnum(enumLegalForms)
  legalForms?: legalForms;

  @IsOptional()
  @Trim()
  @IsEnum(enumFacilities)
  facilities?: facilities;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  veterinaryFacilities?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ownVet?: boolean;

  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(9)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Trim()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cityId?: number;
}
