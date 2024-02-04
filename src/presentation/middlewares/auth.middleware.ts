import { NextFunction, Request, Response } from 'express';
import { HttpCodes, JWTAdapter } from '../../config';
import { UserRoles } from '../../interfaces';
import { UnauthorizedError } from '../../domain';

export class AuthMiddleware {
  constructor(private readonly jwt: JWTAdapter) {}

  public authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.signedCookies;

    if (!token)
      return res
        .status(HttpCodes.UNAUTHORIZED)
        .json({ message: 'Invalid authentication' });

    const payload = await this.jwt.validateToken(token);

    if (!payload)
      return res
        .status(HttpCodes.UNAUTHORIZED)
        .json({ message: 'Invalid authentication' });

    req.body.user = payload;
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
