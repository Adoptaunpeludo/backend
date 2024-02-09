import { Request, Response } from 'express';
import { HttpCodes } from '../../config';
import { AnimalService } from '../services/animal.service';

export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  create = async (req: Request, res: Response) => {
    const resp = await this.animalService.create();

    res.status(HttpCodes.OK).json({ message: resp });
  };

  getAll = async (req: Request, res: Response) => {
    res.status(HttpCodes.OK).json({ message: 'Get All Animals' });
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
