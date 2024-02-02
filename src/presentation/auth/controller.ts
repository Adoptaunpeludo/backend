import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpCodes } from '../../config/http-status-codes.adapter';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = (req: Request, res: Response) => {
    this.authService
      .registerUser(req.body!)
      .then((user) => res.status(HttpCodes.CREATED).json(user))
      .catch((err) => {
        throw err;
      });
  };

  login = (req: Request, res: Response) => {
    res.json('Login');
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('ValidateEmail');
  };
}
