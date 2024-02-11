import { Request, Response } from 'express';
import { HttpCodes } from '../../config';
import { AnimalService } from '../services/animal.service';
import { BadRequestError } from '../../domain';
import { AnimalEntity } from '../../domain/entities/animals.entity';

export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  createCat = async (req: Request, res: Response) => {
    const { user, ...animal } = req.body;

    if (animal.type !== 'cat')
      throw new BadRequestError('Wrong route, use /dog');

    const cat = await this.animalService.createCat(user.id, user.name, animal);

    res.status(HttpCodes.OK).json(cat);
  };

  createDog = async (req: Request, res: Response) => {
    const { user, ...animal } = req.body;

    if (animal.type !== 'dog')
      throw new BadRequestError('Wrong route, use /cat');

    const dog = await this.animalService.createDog(user.id, user.name, animal);

    res.status(HttpCodes.OK).json(dog);
  };

  getAll = async (req: Request, res: Response) => {
    const { limit = 10, page = 1, ...filters } = req.query;

    const { animals, ...pagination } = await this.animalService.getAll(
      { limit: +limit, page: +page },
      filters
    );

    const animalsEntity = AnimalEntity.fromArray(animals);
    res.status(HttpCodes.OK).json({ ...pagination, animalsEntity });
  };

  getSingle = async (req: Request, res: Response) => {
    const { term } = req.params;

    const animal = await this.animalService.getSingle(term);

    const detail = AnimalEntity.fromObjectDetail(animal);

    res.status(HttpCodes.OK).json(detail);
  };

  update = async (req: Request, res: Response) => {
    const { term } = req.params;
    const { user, ...updates } = req.body;

    console.log({ updates });

    await this.animalService.update(updates, user, term);

    res.status(HttpCodes.OK).json({ message: 'Update Animal' });
  };

  delete = async (req: Request, res: Response) => {
    const { term } = req.params;
    const { user } = req.body;

    await this.animalService.delete(user, term);

    res.status(HttpCodes.OK).json({ message: 'Animal deleted' });
  };
}
