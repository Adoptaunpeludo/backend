import { Router } from 'express';
import { UserController } from './controller';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserService } from '../services';
import { ValidationMiddleware } from '../middlewares';
import { UpdateUserDto } from '../../domain';
import { UpdatePasswordDto } from '../../domain/dtos/auth/update-password.dto';
import { UpdateSocialMediaDto } from '../../domain/dtos/users/update-social-media.dto';
import { S3Service } from '../services/s3.service';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';
import { prismaWithPasswordExtension as prisma } from '../../data/postgres';

export class UserRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);
    const userService = new UserService();
    const userController = new UserController(userService);
    const s3Service = new S3Service(
      envs.AWS_REGION,
      envs.AWS_ACCESS_KEY_ID,
      envs.AWS_SECRET_ACCESS_KEY,
      envs.AWS_BUCKET
    );
    const fileUploadMiddleware = new FileUploadMiddleware(s3Service);

    router.get('/me', authMiddleware.authenticateUser, userController.getUser);

    router.get(
      '/',
      authMiddleware.authenticateUser,
      // authMiddleware.authorizePermissions('admin'),
      userController.getAllUsers
    );

    //* TODO: getSingle

    router.delete(
      '/:email',
      authMiddleware.authenticateUser,
      userController.deleteUser
    );

    router.put(
      '/:email',
      authMiddleware.authenticateUser,
      ValidationMiddleware.validate(UpdateUserDto),
      // fileUploadMiddleware.single,
      fileUploadMiddleware.multiple,
      // fileUploadMiddleware.multiUpload,
      userController.updateUser
    );

    router.post(
      '/change-password',
      authMiddleware.authenticateUser,
      ValidationMiddleware.validate(UpdatePasswordDto),
      userController.changePassword
    );

    router.post(
      '/update-social-media',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      ValidationMiddleware.validate(UpdateSocialMediaDto),
      userController.updateSocialMedia
    );

    return router;
  }
}
