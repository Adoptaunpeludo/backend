import { Router } from 'express';
import { UserController } from './controller';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class UserRoutes {
  static get routes() {
    const router = Router();
    const userController = new UserController();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);

    router.get('/me', authMiddleware.authenticateUser, userController.getUser);

    router.get(
      '/',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('admin'),
      userController.getAllUsers
    );

    router.delete('/:email', userController.deleteUser);

    return router;
  }
}
