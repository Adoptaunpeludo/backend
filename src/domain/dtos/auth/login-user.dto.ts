import { Trim } from 'class-sanitizer';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO (Data Transfer Object) for login users.
 */
export class LoginUserDto {
  @IsEmail()
  @Trim()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'password should be minimum of 8 characters' })
  password!: string;
}
