import { Trim } from 'class-sanitizer';
import { IsEnum, IsString } from 'class-validator';

enum gender {
  'male',
  'female',
}

export class CreateAnimalDto {
  @IsString()
  @IsEnum(gender)
  @Trim()
  gender!: gender;
}
