import { HttpCodes } from './http-status-codes.adapter';

describe('http-status-codes.adapter.ts', () => {
  test('Should return correct status codes', () => {
    expect(HttpCodes.BAD_REQUEST).toBe(400);
    expect(HttpCodes.CREATED).toBe(201);
    expect(HttpCodes.FORBIDDEN).toBe(403);
    expect(HttpCodes.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HttpCodes.NOT_FOUND).toBe(404);
    expect(HttpCodes.OK).toBe(200);
    expect(HttpCodes.UNAUTHORIZED).toBe(401);
  });
});
