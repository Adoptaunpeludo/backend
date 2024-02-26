import { Trim } from 'class-sanitizer';
import { IsEmail } from 'class-validator';

/**
 * DTO (Data Transfer Object) for forgot password.
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'email should be a valid email address' })
  @Trim()
  email!: string;
}
