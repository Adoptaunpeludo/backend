import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export class BcryptAdapter {
  /**
   * Hashes the provided password using bcrypt.
   * @param password - The plaintext password to be hashed.
   * @returns The hashed password.
   */
  static hash(password: string) {
    const salt = genSaltSync();

    return hashSync(password, salt);
  }

  /**
   * Compares a plaintext password with a hashed password using bcrypt.
   * @param password - The plaintext password to be compared.
   * @param hash - The hashed password to compare against.
   * @returns True if the passwords match, false otherwise.
   */
  static compare(password: string, hash: string) {
    return compareSync(password, hash);
  }
}
