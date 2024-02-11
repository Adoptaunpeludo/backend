import { validate } from 'uuid';

export class UUID {
  static validate(value: string): boolean {
    return validate(value);
  }
}
