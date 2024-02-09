import { BcryptAdapter } from '../../config/bcrypt.adapter';

describe('bcrypt.adapter.ts', () => {
  const password = 'secret';
  let hashedPassword: string;
  test('Should return a hashed password', () => {
    hashedPassword = BcryptAdapter.hash(password);

    expect(hashedPassword).toStrictEqual(expect.any(String));
  });

  test('Should return true if passwords match', () => {
    const isMatch = BcryptAdapter.compare(password, hashedPassword);

    expect(isMatch).toBeTruthy();
  });

  test('Should return false if passwords do not match', () => {
    const wrongPass = 'secrets';

    const isMatch = BcryptAdapter.compare(wrongPass, hashedPassword);

    expect(isMatch).toBeFalsy();
  });
});
