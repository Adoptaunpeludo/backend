import { Router } from 'express';
import { AuthController } from './controller';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { AuthService } from '../services/auth.service';
import { JWTAdapter, envs } from '../../config';
import { LoginUserDto, RegisterUserDto } from '../../domain';
import { EmailService } from '../services/email.service';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const emailService = new EmailService(
      envs.MAIL_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY
    );
    const service = new AuthService(jwt, emailService, envs.WEBSERVICE_URL);
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
    router.get('/validate-email/:token', controller.validateEmail);

    return router;
  }
}
