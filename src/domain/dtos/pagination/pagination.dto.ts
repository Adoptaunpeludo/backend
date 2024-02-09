import { ToInt } from 'class-sanitizer';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  page?: number;
}
