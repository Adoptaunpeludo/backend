import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsString,
} from 'class-validator';
import { animal_size, genter_enum } from '@prisma/client';
import { Trim } from 'class-sanitizer';

enum enum_animal_size {
  SMALL = 'small',
  MEDIUM = 'medium',
  BIG = 'big',
  VERY_BIG = 'very_big',
}

enum enum_genter_enum {
  MALE = 'male',
  FEMALE = 'female',
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
  @IsEnum(enum_animal_size)
  size?: animal_size;

  @IsOptional()
  @Trim()
  @IsEnum(enum_genter_enum)
  gender?: genter_enum;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @Trim()
  slug?: string;

  @IsOptional()
  @Trim()
  id?: string;
}
