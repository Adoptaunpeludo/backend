import { NextFunction, Request, Response } from 'express';
import { AuthMiddleware } from './auth.middleware';
import { HttpCodes, JWTAdapter } from '../../config';

interface Req extends Request {
  signedCookies: {
    token: 'validToken';
  };
  body: {};
}

describe('auth.middleware.ts', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  const jwt = new JWTAdapter('secret');
  test('should extract token from signed cookies, validate it using JWTAdapter, add user payload to request body, and call next()', async () => {
    jwt.validateToken = jest.fn().mockResolvedValue({ userId: '123' });

    const authMiddleware = new AuthMiddleware(jwt);

    const req = {
      signedCookies: {
        token: 'validToken',
      },
      body: {},
    } as Request;

    await authMiddleware.authenticateUser(req, res, next);

    expect(jwt.validateToken).toHaveBeenCalledWith(req.signedCookies.token);
    expect(req.body.user).toEqual({ userId: '123' });
    expect(next).toHaveBeenCalled();
  });

  test('should return UNAUTHORIZED and an error message when no token is found in cookies', async () => {
    jwt.validateToken = jest.fn();

    const authMiddleware = new AuthMiddleware(jwt);

    const req = {
      signedCookies: {},
    } as Request;

    await authMiddleware.authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid authentication',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return UNAUTHORIZED and an error message when the token validation fails', async () => {
    jwt.validateToken = jest.fn().mockResolvedValue(null);

    const authMiddleware = new AuthMiddleware(jwt);

    const req = {
      signedCookies: {
        token: 'invalidToken',
      },
      body: {},
    } as Request;

    await authMiddleware.authenticateUser(req, res, next);

    expect(jwt.validateToken).toHaveBeenCalledWith('invalidToken');
    expect(res.status).toHaveBeenCalledWith(HttpCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenLastCalledWith({
      message: 'Invalid authentication',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
