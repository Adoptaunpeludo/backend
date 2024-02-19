import { NextFunction, Request, Response } from 'express';

import { JWTAdapter } from '../../config';
import { UserRoles } from '../../domain/interfaces';
import { UnauthenticatedError, UnauthorizedError } from '../../domain';
import { prisma } from '../../data/postgres';
import { AttachCookiesToResponse } from '../../utils/response-cookies';

/**
 * Middleware class for authentication and authorization.
 */
export class AuthMiddleware {
  /**
   * Constructs an instance of AuthMiddleware.
   * @param jwt - Instance of JWTAdapter for handling JSON Web Tokens.
   */
  constructor(private readonly jwt: JWTAdapter) {}

  /**
   * Middleware for authenticating user requests.
   */
  public authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { refreshToken, accessToken } = req.signedCookies;

    // Check if refresh token and access token are present
    if (!refreshToken && !accessToken)
      throw new UnauthenticatedError('Please first login');

    if (accessToken) {
      // Validate access token
      const payload = this.jwt.validateToken(accessToken);
      if (!payload) throw new UnauthorizedError('Invalid token validation');
      req.user = payload.user;
      return next();
    }

    // Validate refresh token
    const payload = this.jwt.validateToken(refreshToken);
    if (!payload) throw new UnauthorizedError('Invalid token validation');

    const existingToken = await prisma.token.findUnique({
      where: { userId: payload.user.id, refreshToken: payload.refreshToken },
    });

    // Check if existing token is valid
    if (!existingToken || !existingToken?.isValid)
      throw new UnauthenticatedError('Authentication Invalid');

    const { user } = payload;

    // Generate new tokens
    const accessTokenJWT = this.jwt.generateToken({ user }, '15m');
    const refreshTokenJWT = this.jwt.generateToken(
      { user, refreshToken: existingToken.refreshToken },
      '1d'
    );

    // Attach new tokens to response cookies
    AttachCookiesToResponse.attach({
      res,
      accessToken: accessTokenJWT!,
      refreshToken: refreshTokenJWT!,
    });

    req.user = user;
    next();
  };

  /**
   * Middleware for authorizing user permissions based on roles.
   * @param roles - Roles allowed to access the resource.
   */
  public authorizePermissions = (...roles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.user;

      if (role === 'admin') return next();

      if (!roles.includes(role!))
        throw new UnauthorizedError('Unauthorized to access this resource');

      next();
    };
  };
}
