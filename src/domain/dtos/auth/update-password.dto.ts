import { Trim } from 'class-sanitizer';
import { IsString, MinLength } from 'class-validator';

/**
 * DTO (Data Transfer Object) for update password.
 */
export class UpdatePasswordDto {
  @IsString()
  @Trim()
  @MinLength(8, { message: 'password should be minimum of 8 characters' })
  oldPassword!: string;

  @IsString()
  @Trim()
  @MinLength(8, { message: 'password should be minimum of 8 characters' })
  newPassword!: string;
}
