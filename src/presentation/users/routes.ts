import { Router } from 'express';

import { UserController } from './controller';
import { JWTAdapter, envs } from '../../config';
import {
  AuthMiddleware,
  ValidationMiddleware,
  FileUploadMiddleware,
} from '../middlewares';
import {
  FileUploadDto,
  UpdateUserDto,
  UpdatePasswordDto,
  UpdateSocialMediaDto,
} from '../../domain';
import { S3Service, QueueService } from '../common/services';
import { UserService } from './service';

export class UserRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);
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
    const userService = new UserService(s3Service, notificationService);
    const userController = new UserController(userService);
    const fileUploadMiddleware = new FileUploadMiddleware(s3Service);

    router.use(authMiddleware.authenticateUser);

    // Favorites
    router.get(
      '/me/favorites',
      authMiddleware.authorizePermissions('adopter'),
      userController.getUserFavorites
    );

    // Notifications
    router.get('/me/notifications', userController.getUserNotifications);

    router.put('/me/notifications/read/:id', userController.readNotification);

    // Animals
    router.get(
      '/me/animals/',
      authMiddleware.authorizePermissions('shelter'),
      userController.getUserAnimals
    );

    // Current User CRUD
    router.get('/me', userController.getCurrentUser);

    router.put(
      '/me',
      ValidationMiddleware.validate(UpdateUserDto),
      userController.updateUser
    );

    router.put(
      '/me/change-password',
      ValidationMiddleware.validate(UpdatePasswordDto),
      userController.changePassword
    );

    router.put(
      '/me/update-social-media',
      [
        authMiddleware.authorizePermissions('shelter'),
        ValidationMiddleware.validate(UpdateSocialMediaDto),
      ],
      userController.updateSocialMedia
    );

    router.delete('/me', userController.deleteUser);

    router.get('/:id', userController.getSingleUser);
    // End Current User CRUD

    // All users
    router.get(
      '/',
      authMiddleware.authorizePermissions('admin'),
      userController.getAllUsers
    );

    // Images
    router.post(
      '/upload-images',
      [
        ValidationMiddleware.validate(FileUploadDto),
        fileUploadMiddleware.multiple('users'),
      ],
      userController.uploadImages
    );

    return router;
  }
}
