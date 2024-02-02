import { Router } from 'express';
import { AuthController } from './controller';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { RegisterUserDto } from '../../domain/dtos/register-user.dto';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const controller = new AuthController();

    router.post('/login', controller.login);
    router.post(
      '/register',
      ValidationMiddleware.validate(RegisterUserDto),
      controller.register
    );
    router.post('/validate-email/:token', controller.validateEmail);

    return router;
  }
}
