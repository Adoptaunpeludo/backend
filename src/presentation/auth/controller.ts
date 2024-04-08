import { Request, Response } from 'express';
import { AuthService } from './service';
import { HttpCodes } from '../../config/';
import { BadRequestError } from '../../domain';
import { AttachCookiesToResponse } from '../../utils/response-cookies';

/**
 * Controller class for handling authentication-related HTTP requests.
 */
export class AuthController {
  /**
   * Constructs an instance of AuthController.
   * @param authService - Instance of AuthService for handling authentication-related operations.
   */
  constructor(private readonly authService: AuthService) {}

  googleAuthRegister = async (req: Request, res: Response) => {
    const { credential, clientId, role } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || '';

    const { accessToken, refreshToken } =
      await this.authService.googleAuthRegister(credential, clientId, role, {
        userAgent,
        ip,
      });

    AttachCookiesToResponse.attach({ res, accessToken, refreshToken });

    res.status(HttpCodes.OK).send({ message: 'User successfully logged in.' });
  };

  googleAuthLogin = async (req: Request, res: Response) => {
    const { credential, clientId } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || '';

    const { accessToken, refreshToken } =
      await this.authService.googleAuthLogin(credential, clientId, {
        userAgent,
        ip,
      });

    AttachCookiesToResponse.attach({ res, accessToken, refreshToken });

    res.status(HttpCodes.OK).json({ message: 'User successfully logged in.' });
  };

  /**
   * Registers a new user.
   */
  register = async (req: Request, res: Response) => {
    const { role } = req.body;

    if (role !== 'adopter' && role !== 'shelter')
      throw new BadRequestError(
        `Invalid role ${role}, must be "adopter" or "shelter"`
      );

    const user = await this.authService.registerUser(req.body!);

    res.status(HttpCodes.CREATED).json({
      message: 'Success!, Please check your email to verify your account',
      token: user.verificationToken,
    });
  };

  /**
   * Resends the verification token to a user's email.
   */
  resendVerificationToken = async (req: Request, res: Response) => {
    const { email } = req.params;

    const verificationToken = await this.authService.resendValidationEmail(
      email
    );

    res.status(HttpCodes.OK).json({
      message: 'Success!, Please check your email to verify your account',
      token: verificationToken,
    });
  };

  /**
   * Logs in a user.
   */
  login = async (req: Request, res: Response) => {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || '';

    const { accessToken, refreshToken } = await this.authService.loginUser(
      req.body,
      {
        userAgent,
        ip,
      }
    );

    //* TODO: Private method
    AttachCookiesToResponse.attach({ res, accessToken, refreshToken });

    res.status(HttpCodes.OK).json({ message: 'User successfully logged in.' });
  };

  /**
   * Logs out a user.
   */
  logout = async (req: Request, res: Response) => {
    await this.authService.logout(req.user.id!);

    res.cookie('refreshToken', 'logout', {
      httpOnly: true,
      secure: true,
      signed: true,
      sameSite: 'none',
      expires: new Date(Date.now()),
    });

    res.cookie('accessToken', 'logout', {
      httpOnly: true,
      secure: true,
      signed: true,
      sameSite: 'none',
      expires: new Date(Date.now()),
    });

    res.sendStatus(HttpCodes.OK);
  };

  /**
   * Verifies a user's email.
   */
  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;

    await this.authService.verifyEmail(token);

    res.status(HttpCodes.OK).json({ message: 'Email validated', token });
  };

  /**
   * Sends a reset password email to a user.
   */
  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const token = await this.authService.forgotPassword(email);

    res
      .status(HttpCodes.OK)
      .json({ message: 'Reset password email sent successfully', token });
  };

  /**
   * Resets a user's password.
   */
  resetPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { token } = req.params;

    await this.authService.resetPassword(password, token);

    res.status(HttpCodes.OK).json({ message: 'Password reset' });
  };
}
