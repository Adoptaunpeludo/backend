import { Request, Response } from 'express';
import { HttpCodes } from '../../config';
import { AnimalService } from '../services/animal.service';
import { BadRequestError } from '../../domain';
import { AnimalEntity } from '../../domain/entities/animals.entity';

export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  createCat = async (req: Request, res: Response) => {
    const animal = req.body;
    const user = req.user;

    if (animal.type !== 'cat')
      throw new BadRequestError('Wrong route, use /dog');

    const cat = await this.animalService.createCat(
      user.id!,
      user.name!,
      animal
    );

    res.status(HttpCodes.CREATED).json(cat);
  };

  createDog = async (req: Request, res: Response) => {
    const animal = req.body;
    const user = req.user;

    if (animal.type !== 'dog')
      throw new BadRequestError('Wrong route, use /cat');

    const dog = await this.animalService.createDog(
      user.id!,
      user.name!,
      animal
    );

    res.status(HttpCodes.CREATED).json(dog);
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
    const updates = req.body;
    const user = req.user;

    await this.animalService.update(updates, user, term);

    res.status(HttpCodes.OK).json({ message: 'Animal updated' });
  };

  delete = async (req: Request, res: Response) => {
    const { term } = req.params;
    const user = req.user;

    await this.animalService.delete(user, term);

    res.status(HttpCodes.OK).json({ message: 'Animal deleted' });
  };

  uploadImages = async (req: Request, res: Response) => {
    const { files, user } = req;
    const { deleteImages } = req.body;
    const { term } = req.params;

    let imagesToDelete: string[] = [];

    //* Normalize images to an array (in case there is only one image)
    if (deleteImages)
      imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : [deleteImages];

    await this.animalService.updateImages(
      term,
      files as Express.MulterS3.File[],
      user,
      imagesToDelete
    );

    res.status(HttpCodes.OK).json({ message: 'Images updated successfully' });
  };

  addFavorite = async (req: Request, res: Response) => {
    const { id } = req.params;

    const response = await this.animalService.addFavorite(req.user.id!, id);

    res.status(HttpCodes.OK).json(response);
  };

  removeFavorite = async (req: Request, res: Response) => {
    const { id } = req.params;

    const response = await this.animalService.removeFavorite(req.user.id!, id);

    res.status(HttpCodes.OK).json(response);
  };
}
