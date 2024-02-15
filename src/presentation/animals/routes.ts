import { Router } from 'express';
import { AnimalController } from './controller';
import { AnimalService } from '../services/animal.service';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares';
import {
  AnimalFilterDto,
  CreateCatDto,
  CreateDogDto,
  FileUploadDto,
  PaginationDto,
} from '../../domain';
import { UpdateAnimalDto } from '../../domain/dtos/animals/update-animal.dto';
import { S3Service } from '../services';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';

export class AnimalRoutes {
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
    const fileUploadMiddleware = new FileUploadMiddleware(s3Service);
    const animalService = new AnimalService(s3Service);
    const animalController = new AnimalController(animalService);

    router.get(
      '/',
      ValidationMiddleware.validate(PaginationDto),
      ValidationMiddleware.validate(AnimalFilterDto),
      animalController.getAll
    );

    router.get('/:term', animalController.getSingle);

    router.post(
      '/upload-images/:term',
      authMiddleware.authenticateUser,
      ValidationMiddleware.validate(FileUploadDto),
      fileUploadMiddleware.multiple('animals'),
      animalController.uploadImages
    );

    router.post(
      '/cat',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      ValidationMiddleware.validate(CreateCatDto),
      animalController.createCat
    );

    router.post(
      '/dog',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      ValidationMiddleware.validate(CreateDogDto),
      animalController.createDog
    );

    router.put(
      '/:term',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      ValidationMiddleware.validate(UpdateAnimalDto),
      animalController.update
    );

    router.delete(
      '/:term',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      animalController.delete
    );

    router.post(
      '/:id/add-favorite',
      authMiddleware.authenticateUser,
      animalController.addToFavorites
    );

    return router;
  }
}
