import { Router } from 'express';
import { AuthController } from './controller';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { AuthService } from '../services/auth.service';
import { JWTAdapter, envs } from '../../config';
import { LoginUserDto, RegisterUserDto } from '../../domain';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const service = new AuthService(jwt);
    const controller = new AuthController(service);

    router.post(
      '/login',
      ValidationMiddleware.validate(LoginUserDto),
      controller.login
    );
    router.post(
      '/register',
      ValidationMiddleware.validate(RegisterUserDto),
      controller.register
    );
    router.post('/validate-email/:token', controller.validateEmail);

    return router;
  }
}
