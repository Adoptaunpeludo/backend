import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsString,
  Min,
} from 'class-validator';
import { animal_size, gender_enum } from '@prisma/client';
import { ToInt, Trim } from 'class-sanitizer';
import { Type } from 'class-transformer';

enum enumAnimalSize {
  S = 'small',
  M = 'medium',
  B = 'big',
  VB = 'very_big',
}

enum enumGenderEnum {
  M = 'male',
  F = 'female',
}

enum ageRange {
  P = 'puppy',
  A = 'adult',
  S = 'senior',
}

export class AnimalFilterDto {
  @IsOptional()
  @Trim()
  @IsUUID()
  createdBy?: string;

  @IsOptional()
  @Trim()
  @IsString()
  name?: string;

  @IsOptional()
  @Trim()
  @IsEnum(enumAnimalSize)
  size?: animal_size;

  @IsOptional()
  @Trim()
  @IsEnum(enumGenderEnum)
  gender?: gender_enum;

  @IsOptional()
  @IsString()
  @IsEnum(ageRange)
  age?: ageRange;

  @IsOptional()
  @Trim()
  slug?: string;

  @IsOptional()
  @Trim()
  id?: string;
}
