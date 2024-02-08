import { Trim } from 'class-sanitizer';
import {
  IsArray,
  IsEnum,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { AllowedMedia } from '../../../interfaces';
import { Type } from 'class-transformer';

export enum AllowedMediaItems {
  Facebook = 'facebook',
  XTweet = 'xtweet',
  Instagram = 'instagram',
}

export class SocialMediaDto {
  @IsEnum(AllowedMediaItems)
  name!: AllowedMedia;

  @IsUrl()
  @Trim()
  url!: string;
}

export class UpdateSocialMediaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaDto)
  socialMedia!: SocialMediaDto[];
}
