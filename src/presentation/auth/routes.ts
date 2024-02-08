import { Router } from 'express';

import { AuthController } from './controller';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares';
import { AuthService, EmailService, ProducerService } from '../services';
import { JWTAdapter, envs } from '../../config';
import { LoginUserDto, RegisterUserDto } from '../../domain';
import { ForgotPasswordDto, ResetPasswordDto } from '../../domain/dtos';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const emailService = new EmailService(
      envs.MAIL_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY
    );

    const producer = new ProducerService(envs.RABBITMQ_URL, 'email-service');

    const authService = new AuthService(
      jwt,
      producer,
      emailService,
      envs.WEBSERVICE_URL
    );
    const authController = new AuthController(authService);
    const authMiddleware = new AuthMiddleware(jwt);

    router.post(
      '/login',
      ValidationMiddleware.validate(LoginUserDto),
      authController.login
    );

    router.delete(
      '/logout',
      authMiddleware.authenticateUser,
      authController.logout
    );

    router.post(
      '/register',
      ValidationMiddleware.validate(RegisterUserDto),
      authController.register
    );

    router.post(
      '/forgot-password',
      ValidationMiddleware.validate(ForgotPasswordDto),
      authController.forgotPassword
    );

    router.post(
      '/reset-password/:token',
      ValidationMiddleware.validate(ResetPasswordDto),
      authController.resetPassword
    );

    router.post('/verify-email/:token', authController.verifyEmail);

    return router;
  }
}
