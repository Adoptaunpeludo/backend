import { HttpCodes } from '../../../config/http-status-codes.adapter';
import { CustomAPIError } from '../../../domain/errors/custom-api.error';
import { UnauthenticatedError } from '../../../domain/errors/unauthenticated.error';
describe('unauthenticated.error.ts', () => {
  test('should set the name, message, and statusCode correctly when creating an instance with a message parameter', () => {
    const errorMessage = 'Invalid credentials';
    const error = new UnauthenticatedError(errorMessage);

    expect(error.name).toBe('Unauthenticated');
    expect(error.message).toBe(errorMessage);
    expect(error.statusCode).toBe(HttpCodes.UNAUTHORIZED);
  });

  test('should inherit from CustomAPIError and be catchable by a catch block that catches CustomAPIError instances', () => {
    const errorMessage = 'Invalid credentials';
    const error = new UnauthenticatedError(errorMessage);

    expect(error instanceof CustomAPIError).toBe(true);

    try {
      throw error;
    } catch (e: any) {
      expect(e instanceof CustomAPIError).toBe(true);
      expect(e.name).toBe('Unauthenticated');
      expect(e.message).toBe(errorMessage);
      expect(e.statusCode).toBe(HttpCodes.UNAUTHORIZED);
    }
  });
});
