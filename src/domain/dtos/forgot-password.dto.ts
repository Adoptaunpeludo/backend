import { Trim } from 'class-sanitizer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'email should be a valid email address' })
  @Trim()
  email!: string;
}
