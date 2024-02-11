import { Trim, ToBoolean } from 'class-sanitizer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { facilities, legalForms } from '../../interfaces';
import { Type } from 'class-transformer';

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
  @IsEnum(enumLegalForms)
  @IsOptional()
  legalForms?: legalForms;

  @Trim()
  @IsEnum(enumFacilities)
  @IsOptional()
  facilities?: facilities;

  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  veterinaryFacilities?: boolean;

  @IsBoolean()
  @ToBoolean()
  @IsOptional()
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
  @IsNumber()
  @Type(() => Number)
  cityId?: number;
}
