import { Request, Response } from 'express';
import { AuthService } from '../services';
import { HttpCodes, envs } from '../../config/';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const user = await this.authService.registerUser(req.body!);

    res.status(HttpCodes.CREATED).json(user);
  };

  login = async (req: Request, res: Response) => {
    const token = await this.authService.loginUser(req.body!);

    const oneDay = 1000 * 60 * 24 * 60;
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: envs.NODE_ENV === 'production',
      signed: true,
    });

    res.status(HttpCodes.OK).json({ message: 'User successfully logged in.' });
  };

  validateEmail = (req: Request, res: Response) => {
    res.json(req.params);
  };
}
