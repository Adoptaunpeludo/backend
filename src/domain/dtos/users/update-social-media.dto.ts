import { Trim } from 'class-sanitizer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AllowedMedia } from '../../interfaces';
import { Type } from 'class-transformer';

export enum AllowedMediaItems {
  Facebook = 'facebook',
  XTweet = 'xtweet',
  Instagram = 'instagram',
}

/**
 * DTO (Data Transfer Object) for Social Media.
 */
export class SocialMediaDto {
  @IsEnum(AllowedMediaItems)
  name!: AllowedMedia;

  @IsString()
  @Trim()
  @IsOptional()
  url?: string;
}

/**
 * DTO (Data Transfer Object) for updating Social Media.
 */
export class UpdateSocialMediaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaDto)
  socialMedia!: SocialMediaDto[];
}
