import { Router } from 'express';
import { AuthController } from './controller';
import { ValidationMiddleware } from '../middlewares';
import { AuthService, EmailService } from '../services';
import { JWTAdapter, envs } from '../../config';
import { LoginUserDto, RegisterUserDto } from '../../domain';
import { ForgotPasswordDto } from '../../domain/dtos';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const emailService = new EmailService(
      envs.MAIL_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY
    );
    const authService = new AuthService(jwt, emailService, envs.WEBSERVICE_URL);
    const authController = new AuthController(authService);

    router.post(
      '/login',
      ValidationMiddleware.validate(LoginUserDto),
      authController.login
    );

    router.post(
      '/register',
      ValidationMiddleware.validate(RegisterUserDto),
      authController.register
    );

    router.post(
      '/forgot-password/',
      ValidationMiddleware.validate(ForgotPasswordDto),
      authController.forgotPassword
    );

    router.get('/validate-email/:token', authController.verifyEmail);

    return router;
  }
}
