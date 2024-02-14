import { HttpCodes } from '../../../config/http-status-codes.adapter';
import { NotFoundError } from '../../../domain/errors/not-found.error';
describe('not-found.error.ts', () => {
  test('should set the name, message, and statusCode correctly when a message parameter is provided', () => {
    const errorMessage = 'Resource not found';
    const notFoundError = new NotFoundError(errorMessage);

    expect(notFoundError.name).toBe('Not Found');
    expect(notFoundError.message).toBe(errorMessage);
    expect(notFoundError.statusCode).toBe(HttpCodes.NOT_FOUND);
  });
});
