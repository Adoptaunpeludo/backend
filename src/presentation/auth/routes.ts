import { Router } from 'express';

import { AuthController } from './controller';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares';
import { QueueService, S3Service } from '../shared/services';
import { AuthService } from './service';
import { JWTAdapter, envs } from '../../config';
import {
  LoginUserDto,
  RegisterUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../domain';
import { OAuth2Client } from 'google-auth-library';
import rateLimiter from 'express-rate-limit';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    // Rate limiter middleware to limit the number of requests from an IP address
    const apiLimiter = rateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes window
      max: 10, // Limit each IP to 10 requests per windowMs
      message: {
        msg: 'Máximo de peticiones alcanzado, reintentalo tras 15 minutos',
      },
    });

    const jwt = new JWTAdapter(envs.JWT_SEED);

    const emailService = new QueueService(envs.RABBITMQ_URL, 'email-request');

    const client = new OAuth2Client();
    const s3Service = new S3Service(
      envs.AWS_REGION,
      envs.AWS_ACCESS_KEY_ID,
      envs.AWS_SECRET_ACCESS_KEY,
      envs.AWS_BUCKET
    );

    const notificationService = new QueueService(
      envs.RABBITMQ_URL,
      'notification-request'
    );

    const authService = new AuthService(
      jwt,
      emailService,
      client,
      s3Service,
      notificationService
    );
    const authController = new AuthController(authService);
    const authMiddleware = new AuthMiddleware(jwt);

    router.post('/google-auth-login', authController.googleAuthLogin);
    router.post('/google-auth-register', authController.googleAuthRegister);

    router.post(
      '/login',
      // apiLimiter,
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
      '/resend-validation-email/:email',
      authController.resendVerificationToken
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
