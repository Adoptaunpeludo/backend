import { Trim } from 'class-sanitizer';
import { IsString, Matches } from 'class-validator';

/**
 * DTO (Data Transfer Object) for creating a chat.
 */
export class CreateChatDto {
  @Trim()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{3,}-[a-zA-Z0-9]{3,}-[a-zA-Z0-9]{3,}$/)
  room!: string;
}
