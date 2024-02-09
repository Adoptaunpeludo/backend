import { Router } from 'express';
import { AnimalController } from './controller';
import { AnimalService } from '../services/animal.service';

export class AnimalRoutes {
  static get routes() {
    const router = Router();

    const animalService = new AnimalService();
    const animalController = new AnimalController(animalService);

    router.get('/', animalController.getAll);

    router.get('/:id', animalController.getSingle);

    router.post('/', animalController.create);

    router.put('/:id', animalController.update);

    router.delete('/:id', animalController.delete);

    return router;
  }
}
