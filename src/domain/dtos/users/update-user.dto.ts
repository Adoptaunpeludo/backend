import { Trim, ToInt, ToBoolean } from 'class-sanitizer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { legalForms } from '../../interfaces';
import { facilities } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

enum enum_legalForms {
  A = 'association',
  PUA = 'public_utility_association',
  AF = 'autonomous_foundation',
  NF = 'national_foundation',
  O = 'other',
}

enum enum_facilities {
  FH = 'foster_homes',
  MOPF = 'municipal_or_public_facilities',
  LF = 'leased_facilities',
  OF = 'owned_facilities',
  PR = 'private_residences',
}

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
  @MinLength(9)
  @IsOptional()
  dni?: string;

  @IsString()
  @Trim()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @IsString()
  @Trim()
  @MinLength(9)
  @IsOptional()
  cif?: string;

  @Trim()
  @IsEnum(enum_legalForms)
  @IsOptional()
  legalForms?: legalForms;

  @Trim()
  @IsEnum(enum_facilities)
  @IsOptional()
  facilities?: facilities;

  @IsBoolean()
  @ToBoolean()
  veterinaryFacilities?: boolean;

  @IsBoolean()
  @ToBoolean()
  ownVet?: boolean;

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
