import { Request, Response } from 'express';
import { HttpCodes } from '../../config';
import { BadRequestError } from '../../domain';
import { AnimalService } from './service';

/**
 * Controller class for handling animal-related HTTP requests.
 */
export class AnimalController {
  /**
   * Constructs an instance of AnimalController.
   * @param animalService - Instance of AnimalService for handling animal-related operations.
   */
  constructor(private readonly animalService: AnimalService) {}

  /**
   * Creates a new cat.
   */
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

  /**
   * Creates a new dog.
   */
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

  /**
   * Retrieves a list of animals.
   */
  getAll = async (req: Request, res: Response) => {
    const { limit = 10, page = 1, ...filters } = req.query;

    const { animals, ...pagination } = await this.animalService.getAll(
      { limit: +limit, page: +page },
      filters
    );

    res.status(HttpCodes.OK).json({ ...pagination, animals });
  };

  /**
   * Retrieves a single animal by term.
   */
  getSingle = async (req: Request, res: Response) => {
    const { term } = req.params;

    const animal = await this.animalService.getSingle(term);

    res.status(HttpCodes.OK).json(animal);
  };

  /**
   * Updates an animal.
   */
  update = async (req: Request, res: Response) => {
    const { term } = req.params;
    const updates = req.body;
    const user = req.user;

    await this.animalService.update(user, term, updates);

    res.status(HttpCodes.OK).json({ message: 'Animal updated' });
  };

  /**
   * Deletes an animal.
   */
  delete = async (req: Request, res: Response) => {
    const { term } = req.params;
    const user = req.user;

    await this.animalService.delete(user, term);

    res.status(HttpCodes.OK).json({ message: 'Animal deleted' });
  };

  /**
   * Uploads images for an animal.
   */
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
      user,
      term,
      files as Express.MulterS3.File[],
      imagesToDelete
    );

    res.status(HttpCodes.OK).json({ message: 'Images updated successfully' });
  };

  /**
   * Adds an animal to favorites for a user.
   */
  addFavorite = async (req: Request, res: Response) => {
    const { id } = req.params;

    const response = await this.animalService.addFavorite(req.user.id!, id);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   * Removes an animal from favorites for a user.
   */
  removeFavorite = async (req: Request, res: Response) => {
    const { id } = req.params;

    const response = await this.animalService.removeFavorite(req.user.id!, id);

    res.status(HttpCodes.OK).json(response);
  };
}
