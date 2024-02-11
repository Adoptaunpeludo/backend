import { Router } from 'express';
import { AnimalController } from './controller';
import { AnimalService } from '../services/animal.service';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares';
import {
  AnimalFilterDto,
  CreateCatDto,
  CreateDogDto,
  PaginationDto,
} from '../../domain';

export class AnimalRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);
    const animalService = new AnimalService();
    const animalController = new AnimalController(animalService);

    router.get(
      '/',
      ValidationMiddleware.validate(PaginationDto),
      ValidationMiddleware.validate(AnimalFilterDto),
      animalController.getAll
    );

    router.get('/:term', animalController.getSingle);

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
      '/:id',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      ValidationMiddleware.validate(CreateDogDto),
      animalController.update
    );

    router.delete(
      '/:term',
      authMiddleware.authenticateUser,
      authMiddleware.authorizePermissions('shelter'),
      animalController.delete
    );

    return router;
  }
}
