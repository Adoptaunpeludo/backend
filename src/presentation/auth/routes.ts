import { Router } from 'express';
import { AuthController } from './controller';

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const controller = new AuthController();

    router.post('/login', controller.login);
    router.post('/register', controller.register);
    router.post('/validate-email/:token', controller.validateEmail);

    return router;
  }
}
