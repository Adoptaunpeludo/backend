import { Trim } from 'class-sanitizer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ShelterFilterDto {
  @IsOptional()
  @Trim()
  @IsEnum(['shelter', 'adopter'])
  role?: 'shelter' | 'adopter';

  @IsOptional()
  @Trim()
  @IsString()
  city?: string;

  @IsOptional()
  @Trim()
  @IsString()
  username?: string;
}
