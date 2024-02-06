import { Router } from 'express';
import { UserController } from './controller';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AuthService, UserService } from '../services';
import { AuthController } from '../auth/controller';
import { ValidationMiddleware } from '../middlewares';
import { UpdateUserDto } from '../../domain';
import { UpdatePasswordDto } from '../../domain/dtos/update-password.dto';

export class UserRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);
    const userService = new UserService();
    const userController = new UserController(userService);

    router.get('/me', authMiddleware.authenticateUser, userController.getUser);

    router.get(
      '/',
      authMiddleware.authenticateUser,
      // authMiddleware.authorizePermissions('admin'),
      userController.getAllUsers
    );

    router.delete(
      '/:email',
      authMiddleware.authenticateUser,
      userController.deleteUser
    );

    router.put(
      '/:email',
      authMiddleware.authenticateUser,
      ValidationMiddleware.validate(UpdateUserDto),
      userController.updateUser
    );

    router.post(
      '/change-password',
      authMiddleware.authenticateUser,
      ValidationMiddleware.validate(UpdatePasswordDto),
      userController.changePassword
    );

    return router;
  }
}
