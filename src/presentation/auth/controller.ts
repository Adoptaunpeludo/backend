import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpCodes } from '../../config/http-status-codes.adapter';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const user = await this.authService.registerUser(req.body!);

    res.status(HttpCodes.CREATED).json(user);
  };

  login = async (req: Request, res: Response) => {
    const token = await this.authService.loginUser(req.body!);

    res.status(HttpCodes.OK).json({ accessToken: token });
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('ValidateEmail');
  };
}
