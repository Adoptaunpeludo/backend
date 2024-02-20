import { validate } from 'uuid';

/**
 * Utility class for UUID validation.
 */
export class UUID {
  /**
   * Validates a UUID string.
   * @param value The UUID string to validate.
   * @returns A boolean indicating whether the UUID is valid or not.
   */
  static validate(value: string): boolean {
    return validate(value);
  }
}
