import { ToBoolean, ToInt, Trim } from 'class-sanitizer';
import { Transform } from 'class-transformer';
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
  animalType,
} from '../../interfaces/animal.interface';

enum type {
  C = 'cat',
  D = 'dog',
}

enum gender {
  M = 'male',
  F = 'female',
}

enum animalSize {
  S = 'small',
  M = 'medium',
  B = 'big',
  VB = 'very_big',
}

enum energy {
  L = 'light',
  M = 'moderate',
  H = 'high',
}

enum potential {
  N = 'none',
  L = 'low',
  M = 'moderate',
  H = 'high',
  E = 'excessive',
}

enum molting {
  L = 'light',
  M = 'moderate',
  H = 'heavy',
  NS = 'no_shedding',
}

export class CreateAnimalDto {
  @IsEnum(type)
  @Trim()
  type!: animalType;

  @IsString()
  @Trim()
  name!: string;

  @IsNumber()
  @ToInt()
  age!: number;

  @IsString()
  @Trim()
  description!: string;

  @IsString()
  @Trim()
  breed!: string;

  @IsEnum(animalSize)
  @Trim()
  size!: animalSize;

  @IsBoolean()
  @ToBoolean()
  easyTrain!: boolean;

  @IsEnum(energy)
  @Trim()
  energyLevel!: animalEnergy;

  @IsEnum(molting)
  @Trim()
  moltingAmount!: animalMolting;

  @IsString()
  @IsEnum(gender)
  @Trim()
  gender!: gender;

  @IsNumber()
  @ToInt()
  cityId!: number;
}

export class CreateDogDto extends CreateAnimalDto {
  @IsBoolean()
  @ToBoolean()
  departmentAdapted!: boolean;

  @IsEnum(potential)
  @Trim()
  droolingPotential!: animalPotential;

  @IsEnum(potential)
  @Trim()
  bark!: animalPotential;
}

export class CreateCatDto extends CreateAnimalDto {
  @IsEnum(potential)
  @Trim()
  playLevel!: animalPotential;

  @IsBoolean()
  @ToBoolean()
  kidsFriendly!: boolean;

  @IsBoolean()
  @ToBoolean()
  toiletTrained!: boolean;

  @IsEnum(potential)
  @Trim()
  scratchPotential!: animalPotential;
}
