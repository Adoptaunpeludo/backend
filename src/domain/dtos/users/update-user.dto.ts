import { Trim } from 'class-sanitizer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
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
  @MaxLength(9)
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
  @MaxLength(9)
  cif?: string;

  @IsOptional()
  @Trim()
  @IsEnum(enumLegalForms)
  legalForms?: legalForms;

  @IsOptional()
  @IsString({ each: true })
  @IsEnum(enumFacilities, { each: true })
  facilities?: facilities[];

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
  @IsString()
  @Trim()
  city?: string;
}
