import { ToInt, Trim } from 'class-sanitizer';
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
  statusPet,
  type,
} from '../../interfaces/animal.interface';

/**
 * DTO (Data Transfer Object) for creating animals.
 */
export class CreateAnimalDto {
  @IsEnum(type)
  @Trim()
  type!: animalType;

  @IsString()
  @Trim()
  name!: string;

  @IsNumber()
  @Transform(({ value }) => +value)
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
  @Transform(({ value }) => value === 'true')
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

  @IsString()
  @Trim()
  city!: string;

  @IsEnum(statusPet)
  @Trim()
  status!: statusPet;
}

export class CreateDogDto extends CreateAnimalDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
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
  @Transform(({ value }) => value === 'true')
  kidsFriendly!: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  toiletTrained!: boolean;

  @IsEnum(potential)
  @Trim()
  scratchPotential!: animalPotential;
}
