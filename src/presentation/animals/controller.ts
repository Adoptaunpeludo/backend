import { Request, Response } from 'express';
import { HttpCodes } from '../../config';
import { AnimalService } from '../services/animal.service';
import { BadRequestError } from '../../domain';

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

  getAll = async (_req: Request, res: Response) => {
    const animals = await this.animalService.getAll();

    res.status(HttpCodes.OK).json(animals);
  };

  getSingle = async (req: Request, res: Response) => {
    res.status(HttpCodes.OK).json({ message: 'Get Single Animal' });
  };

  update = async (req: Request, res: Response) => {
    res.status(HttpCodes.OK).json({ message: 'Update Animal' });
  };

  delete = async (req: Request, res: Response) => {
    res.status(HttpCodes.OK).json({ message: 'Delete Animal' });
  };
}
