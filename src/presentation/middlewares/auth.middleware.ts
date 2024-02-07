import { NextFunction, Request, Response } from 'express';

import { HttpCodes, JWTAdapter } from '../../config';
import { UserRoles } from '../../interfaces';
import { UnauthenticatedError, UnauthorizedError } from '../../domain';
import { prisma } from '../../data/postgres';
import { AttachCookiesToResponse } from '../../utils/response-cookies';

export class AuthMiddleware {
  constructor(private readonly jwt: JWTAdapter) {}

  public authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { refreshToken, accessToken } = req.signedCookies;

    if (accessToken) {
      const payload = await this.jwt.validateToken(accessToken);
      if (!payload) throw new UnauthorizedError('Invalid token validation');

      const { user } = payload;

      req.body.user = user;
      return next();
    }

    const payload = await this.jwt.validateToken(refreshToken);
    if (!payload) throw new UnauthorizedError('Invalid token validation');

    const existingToken = await prisma.token.findUnique({
      where: { userId: payload.user.id, refreshToken: payload.refreshToken },
    });

    if (!existingToken || !existingToken?.isValid)
      throw new UnauthenticatedError('Authentication Invalid');

    const { user } = payload;

    const accessTokenJWT = await this.jwt.generateToken({ user }, '15m');
    const refreshTokenJWT = await this.jwt.generateToken(
      { user, refreshToken: existingToken.refreshToken },
      '1d'
    );

    AttachCookiesToResponse.attach({
      res,
      accessToken: accessTokenJWT!,
      refreshToken: refreshTokenJWT!,
    });

    req.body.user = user;
    next();
  };

  public authorizePermissions = (...roles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.body.user;

      if (role === 'admin') return next();

      if (!roles.includes(role))
        throw new UnauthorizedError('Unauthorized to access this resource');

      next();
    };
  };
}
