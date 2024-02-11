import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { type as animalType } from '../../interfaces';

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
  size?: enumAnimalSize;

  @IsOptional()
  @Trim()
  @IsEnum(enumGenderEnum)
  gender?: enumGenderEnum;

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

  @IsOptional()
  @Trim()
  @IsEnum(animalType)
  type?: 'cat' | 'dog';
}
