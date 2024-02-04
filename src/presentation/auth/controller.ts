import { Request, Response } from 'express';

import { AuthService } from '../services';
import { HttpCodes, envs } from '../../config/';
import { BadRequestError } from '../../domain';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { role } = req.body;

    if (role !== 'adopter' && role !== 'shelter')
      throw new BadRequestError(
        `Invalid role ${role}, must be "adopter" or "shelter"`
      );

    const user = await this.authService.registerUser(req.body!);

    res.status(HttpCodes.CREATED).json({
      message: 'Susccess!, Please check your email to verify your account',
    });
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

  logout = async (req: Request, res: Response) => {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    res.sendStatus(HttpCodes.OK);
  };

  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;

    await this.authService.verifyEmail(token);

    res.status(HttpCodes.OK).json({ message: 'Email validated' });
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    await this.authService.forgotPassword(email);

    res
      .status(HttpCodes.OK)
      .json({ message: 'Reset password email sent successfully' });
  };

  resetPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { token } = req.params;

    await this.authService.resetPassword(password, token);

    res.status(HttpCodes.OK).json({ message: 'Password reset' });
  };
}
