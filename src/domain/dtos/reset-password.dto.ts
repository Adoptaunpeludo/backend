import { Trim } from 'class-sanitizer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'password should be minimum of 8 characters' })
  password!: string;
}
