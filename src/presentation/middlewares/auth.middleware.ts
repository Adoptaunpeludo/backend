import { NextFunction, Request, Response } from 'express';
import { HttpCodes, JWTAdapter } from '../../config';

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
}
