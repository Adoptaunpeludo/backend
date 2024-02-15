import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

export class FileUploadDto {
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => File)
  // images!: File[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  deleteImages?: String[];
}
