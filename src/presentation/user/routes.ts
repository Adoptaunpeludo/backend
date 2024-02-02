import { Router } from 'express';
import { UserController } from './controller';

export class UserRoutes {
  static get routes() {
    const router = Router();
    const userController = new UserController();

    router.get('/me', userController.getUser);
    router.get('/', userController.getAllUsers);

    return router;
  }
}
