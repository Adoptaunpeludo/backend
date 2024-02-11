import { ToBoolean, ToInt, Trim } from 'class-sanitizer';
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
  type,
} from '../../interfaces/animal.interface';

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
  @ToInt()
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
  @ToBoolean()
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
  @ToInt()
  cityId?: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
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
  @ToBoolean()
  kidsFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  toiletTrained?: boolean;

  @IsOptional()
  @IsEnum(potential)
  @Trim()
  scratchPotential?: animalPotential;
}
