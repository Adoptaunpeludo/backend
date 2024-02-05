import { Request, Response } from 'express';

import { AuthService } from '../services';
import { HttpCodes, envs } from '../../config/';
import { BadRequestError } from '../../domain';
import { AttachCookiesToResponse } from '../../utils/response.cookies';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { role } = req.body;

    if (role !== 'adopter' && role !== 'shelter')
      throw new BadRequestError(
        `Invalid role ${role}, must be "adopter" or "shelter"`
      );

    await this.authService.registerUser(req.body!);

    res.status(HttpCodes.CREATED).json({
      message: 'Success!, Please check your email to verify your account',
    });
  };

  login = async (req: Request, res: Response) => {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const { accessToken, refreshToken } = await this.authService.loginUser(
      req.body!,
      {
        userAgent: userAgent || '',
        ip: ip || '',
      }
    );

    AttachCookiesToResponse.attach({ res, accessToken, refreshToken });

    res.status(HttpCodes.OK).json({ message: 'User successfully logged in.' });
  };

  logout = async (req: Request, res: Response) => {
    await this.authService.logout(req.body.user.id);

    res.cookie('refreshToken', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    res.cookie('accessToken', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    res.sendStatus(HttpCodes.OK);
  };

  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;

    await this.authService.verifyEmail(token);

    res.status(HttpCodes.OK).json({ message: 'Email validated', token });
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const token = await this.authService.forgotPassword(email);

    res
      .status(HttpCodes.OK)
      .json({ message: 'Reset password email sent successfully', token });
  };

  resetPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { token } = req.params;

    await this.authService.resetPassword(password, token);

    res.status(HttpCodes.OK).json({ message: 'Password reset' });
  };
}
