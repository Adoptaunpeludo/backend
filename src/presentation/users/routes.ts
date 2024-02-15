import { Router } from 'express';
import { UserController } from './controller';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserService } from '../services';
import { ValidationMiddleware } from '../middlewares';
import { FileUploadDto, UpdateUserDto } from '../../domain';
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
    const s3Service = new S3Service(
      envs.AWS_REGION,
      envs.AWS_ACCESS_KEY_ID,
      envs.AWS_SECRET_ACCESS_KEY,
      envs.AWS_BUCKET
    );
    const userService = new UserService(s3Service);
    const userController = new UserController(userService);
    const fileUploadMiddleware = new FileUploadMiddleware(s3Service);

    router.use(authMiddleware.authenticateUser);

    router.get('/me', userController.getCurrentUser);

    router.get('/:id', userController.getSingleUser);

    router.get(
      '/',
      // authMiddleware.authorizePermissions('admin'),
      userController.getAllUsers
    );

    router.delete('/', userController.deleteUser);

    router.put(
      '/',
      ValidationMiddleware.validate(UpdateUserDto),
      userController.updateUser
    );

    router.post(
      '/upload-images',
      ValidationMiddleware.validate(FileUploadDto),
      fileUploadMiddleware.multiple('users'),
      userController.uploadImages
    );

    router.put(
      '/change-password',
      ValidationMiddleware.validate(UpdatePasswordDto),
      userController.changePassword
    );

    router.put(
      '/update-social-media',
      authMiddleware.authorizePermissions('shelter'),
      ValidationMiddleware.validate(UpdateSocialMediaDto),
      userController.updateSocialMedia
    );

    return router;
  }
}
