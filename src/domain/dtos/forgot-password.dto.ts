import { Trim } from 'class-sanitizer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'email should be a valid email address' })
  @Trim()
  email!: string;
}
