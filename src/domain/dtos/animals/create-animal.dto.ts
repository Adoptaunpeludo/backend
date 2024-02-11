import { ToBoolean, ToInt, Trim } from 'class-sanitizer';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
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

  @IsEnum(animalSizeEnum)
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
