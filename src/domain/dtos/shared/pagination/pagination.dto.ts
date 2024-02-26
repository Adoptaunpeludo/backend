import { ToInt } from 'class-sanitizer';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO (Data Transfer Object) for pagination.
 */
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
