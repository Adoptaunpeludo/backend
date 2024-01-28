import { Request, Response } from 'express';

export class AuthController {
  constructor() {}

  signup = (req: Request, res: Response) => {
    res.json('Signup');
  };

  login = (req: Request, res: Response) => {
    res.json('Login');
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('ValidateEmail');
  };
}
