import { Trim } from 'class-sanitizer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  animalEnergy,
  animalMolting,
  animalPotential,
  animalSize,
  animalSizeEnum,
  animalType,
  energy,
  gender,
  molting,
  potential,
  statusPet,
  type,
} from '../../interfaces/animal.interface';
import { Transform, Type } from 'class-transformer';

/**
 * DTO (Data Transfer Object) for updating animals.
 */
export class UpdateAnimalDto {
  @IsOptional()
  @IsEnum(type)
  @Trim()
  type?: animalType;

  @IsOptional()
  @IsString()
  @Trim()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsString()
  @Trim()
  description?: string;

  @IsOptional()
  @IsString()
  @Trim()
  breed?: string;

  @IsOptional()
  @IsEnum(animalSizeEnum)
  @Trim()
  size?: animalSize;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  easyTrain?: boolean;

  @IsOptional()
  @IsEnum(energy)
  @Trim()
  energyLevel?: animalEnergy;

  @IsOptional()
  @IsEnum(molting)
  @Trim()
  moltingAmount?: animalMolting;

  @IsOptional()
  @IsString()
  @IsEnum(gender)
  @Trim()
  gender?: gender;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cityId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  departmentAdapted?: boolean;

  @IsOptional()
  @IsEnum(potential)
  @Trim()
  droolingPotential?: animalPotential;

  @IsOptional()
  @IsEnum(potential)
  @Trim()
  bark?: animalPotential;

  @IsOptional()
  @IsEnum(potential)
  @Trim()
  playLevel?: animalPotential;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  kidsFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  toiletTrained?: boolean;

  @IsOptional()
  @IsEnum(potential)
  @Trim()
  scratchPotential?: animalPotential;

  @IsOptional()
  @IsEnum(statusPet)
  @Trim()
  status?: statusPet;
}
