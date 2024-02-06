import { NextFunction, Request, Response } from 'express';
import { AuthMiddleware } from './auth.middleware';
import { HttpCodes, JWTAdapter } from '../../config';
import { prisma } from '../../data/postgres';
import { AttachCookiesToResponse } from '../../utils/';
import { UnauthorizedError } from '../../domain';

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
    jwt.validateToken = jest.fn().mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'adopter',
      },
    });

    const authMiddleware = new AuthMiddleware(jwt);

    const req = {
      signedCookies: {
        refreshToken: 'validRefreshToken',
        accessToken: 'validAccessToken',
      },
      body: {},
    } as Request;

    await authMiddleware.authenticateUser(req, res, next);

    expect(jwt.validateToken).toHaveBeenCalledWith('validAccessToken');
    expect(req.body.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'adopter',
    });
    expect(next).toHaveBeenCalled();
  });

  test('should attach new accessToken and refreshToken cookies to the response when only refreshToken cookie is present', async () => {
    jwt.validateToken = jest.fn().mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'adopter',
      },
    });

    jwt.generateToken = jest.fn().mockResolvedValue('newToken');

    const authMiddleware = new AuthMiddleware(jwt);

    AttachCookiesToResponse.attach = jest.fn();

    const req = {
      signedCookies: {
        refreshToken: 'validRefreshToken',
      },
      body: {},
    } as Request;

    prisma.token.findUnique = jest.fn().mockResolvedValue({
      isValid: true,
    });

    await authMiddleware.authenticateUser(req, res, next);

    expect(jwt.validateToken).toHaveBeenCalledWith('validRefreshToken');

    expect(AttachCookiesToResponse.attach).toHaveBeenCalledWith({
      res,
      accessToken: 'newToken',
      refreshToken: 'newToken',
    });
    expect(next).toHaveBeenCalled();
  });

  test('should authorize user with admin role to access resource', () => {
    const req = {
      body: {
        user: {
          role: 'admin',
        },
      },
    } as Request;

    const authMiddleware = new AuthMiddleware({} as JWTAdapter);

    authMiddleware.authorizePermissions('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should authorize user with specified roles to access resource', () => {
    const req = {
      body: {
        user: {
          role: 'adopter',
        },
      },
    } as Request;

    const authMiddleware = new AuthMiddleware({} as JWTAdapter);

    authMiddleware.authorizePermissions('admin', 'adopter')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should not authorize user with specified roles to access resource', () => {
    const req = {
      body: {
        user: {
          role: 'shelter',
        },
      },
    } as Request;

    const authMiddleware = new AuthMiddleware({} as JWTAdapter);

    expect(() =>
      authMiddleware.authorizePermissions('admin', 'adopter')(req, res, next)
    ).toThrow(UnauthorizedError);

    expect(next).not.toHaveBeenCalled();
  });
});
