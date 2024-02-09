import { Router } from 'express';
import { AnimalController } from './controller';
import { AnimalService } from '../services/animal.service';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares';
import { CreateCatDto, CreateDogDto, PaginationDto } from '../../domain';

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
      animalController.getAll
    );

    router.get('/:id', animalController.getSingle);

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

    router.put('/:id', animalController.update);

    router.delete('/:id', animalController.delete);

    return router;
  }
}
