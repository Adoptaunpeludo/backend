import { Request, Response } from 'express';

export class AuthController {
  //* TODO: DI
  constructor() {}

  register = (req: Request, res: Response) => {
    res.json(req.body);
  };

  login = (req: Request, res: Response) => {
    res.json('Login');
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('ValidateEmail');
  };
}
