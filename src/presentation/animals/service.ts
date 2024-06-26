import { UUID } from '../../config/uuid.adapter';
import { prismaWithSlugExtension as prisma } from '../../data/postgres';
import { BadRequestError, NotFoundError } from '../../domain';
import {
  AnimalFilterDto,
  CreateCatDto,
  CreateDogDto,
  PaginationDto,
} from '../../domain/dtos';
import { AnimalResponse } from '../../domain/interfaces';
import { PayloadUser } from '../../domain/interfaces/payload-user.interface';
import { CheckPermissions } from '../../utils';
import { UpdateAnimalDto } from '../../domain/dtos/animals/update-animal.dto';
import { S3Service, QueueService } from '../shared/services';
import { AnimalEntity } from '../../domain/entities/animals.entity';

/**
 * AnimalService class handles animal-related operations such as creating, updating,
 * and deleting animals, as well as managing favorites and notifications.
 */
export class AnimalService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly emailService: QueueService,
    private readonly notificationService: QueueService
  ) {}

  /**
   * Builds the array of images for an animal based on input files and existing images.
   * @param images - Array of existing images.
   * @param deleteImages - Array of images to delete.
   * @param files - Array of files uploaded by the user.
   * @returns Array of updated images.
   */
  private async buildImages(
    images: string[],
    deleteImages: string[],
    files: Express.MulterS3.File[]
  ) {
    let resultImages: string[] = [];

    if (images)
      resultImages = images.filter((image) => !deleteImages.includes(image));

    if (deleteImages.length > 0) await this.s3Service.deleteFiles(deleteImages);

    if (files && files.length > 0) {
      const uploadedImages = files.map((file) => file.key);
      resultImages = [...resultImages, ...uploadedImages];
    }

    resultImages = resultImages.filter(
      (image, index, array) => array.indexOf(image) === index
    );

    return resultImages;
  }

  /**
   * Retrieves an animal based on term (UUID or slug).
   * @param term - Term representing the animal (UUID or slug).
   * @returns Animal response object.
   * @throws NotFoundError if the animal is not found.
   */
  private async getAnimalFromTerm(term: string) {
    let animal: AnimalResponse | null = null;

    const isUUID = UUID.validate(term);

    if (isUUID)
      animal = await prisma.animal.findUnique({
        where: { id: term },
        include: {
          shelter: { include: { user: true } },
          cat: true,
          dog: true,
          city: true,
        },
      });

    if (!isUUID) {
      animal = await prisma.animal.findUnique({
        where: { slug: term.toLowerCase() },
        include: {
          shelter: { include: { user: true } },
          cat: true,
          dog: true,
          city: true,
        },
      });
    }
    if (!animal) throw new NotFoundError('Animal no encontrado');

    return animal;
  }

  /**
   * Maps animal filter DTO to Prisma compatible filter object.
   * @param animalFilterDto - DTO containing animal filter criteria.
   * @returns Prisma compatible filter object.
   */
  private async mapFilters(animalFilterDto: AnimalFilterDto) {
    let filters: any = {};

    Object.entries(animalFilterDto).forEach(([key, value]) => {
      if (key === 'city') return;

      if (key === 'age') {
        if (value === 'puppy') filters.age = { gte: 0, lt: 2 };
        if (value === 'adult') filters.age = { gte: 2, lt: 10 };
        if (value === 'senior') filters.age = { gte: 10 };
      } else {
        filters[key] = value;
      }
    });

    if (animalFilterDto.shelterName) {
      const shelter = await prisma.user.findUnique({
        where: {
          username: animalFilterDto.shelterName,
        },
        include: {
          shelter: true,
        },
      });

      if (!shelter) throw new NotFoundError('Refugio no encontrado');
      filters.createdBy = shelter.id;
      delete filters.shelterName;
    }

    if (animalFilterDto.city) {
      const city = await prisma.city.findUnique({
        where: { name: animalFilterDto.city },
      });

      if (city) {
        filters.cityId = city.id;
      } else {
        // Manejo si la ciudad no se encuentra
        throw new NotFoundError(
          `Ciudad '${animalFilterDto.city}' no encontrada`
        );
      }
    }

    return filters;
  }

  /**
   * Builds the update query for updating animal information.
   * @param updateAnimalDto - DTO containing updated animal information.
   * @returns Update query object.
   */
  private async buildQuery(updateAnimalDto: UpdateAnimalDto) {
    const updatedAt = new Date();

    let query: any;

    const {
      departmentAdapted,
      droolingPotential,
      bark,
      playLevel,
      kidsFriendly,
      toiletTrained,
      scratchPotential,
      type,
      city,
      ...common
    } = updateAnimalDto;

    query = {
      ...common,
      updatedAt,
      cat:
        type === 'cat'
          ? {
              update: {
                playLevel,
                kidsFriendly,
                toiletTrained,
                scratchPotential,
              },
            }
          : undefined,
      dog:
        type === 'dog'
          ? {
              update: {
                droolingPotential,
                departmentAdapted,
                bark,
              },
            }
          : undefined,
    };

    if (city) {
      const cityObj = await prisma.city.findUnique({
        where: { name: city },
      });

      if (cityObj) {
        query.cityId = cityObj.id;
      } else {
        // Manejo si la ciudad no se encuentra
        throw new Error(`Ciudad '${city}' no encontrada`);
      }
    }

    return query;
  }

  /**
   * Creates a new cat animal.
   * @param userId - ID of the user creating the cat.
   * @param username - Username of the user creating the cat.
   * @param createCatDto - DTO containing cat information.
   * @returns Created cat object.
   */
  public async createCat(
    userId: string,
    username: string,
    createCatDto: CreateCatDto
  ) {
    const {
      playLevel,
      kidsFriendly,
      toiletTrained,
      scratchPotential,
      city,
      ...rest
    } = createCatDto;

    const cityData = await prisma.city.findUnique({
      where: { name: city },
    });

    if (!cityData) {
      throw new BadRequestError(`Ciudad '${city}' no encontrada`);
    }

    const slug = await prisma.animal.generateUniqueSlug({
      name: rest.name.toLowerCase(),
      shelter: username,
    });

    const animal = await prisma.animal.create({
      data: {
        ...rest,
        name: rest.name.toLowerCase(),
        createdBy: userId,
        slug,
        publishStatus: 'published',
        cityId: cityData.id,
        cat: {
          create: { playLevel, kidsFriendly, toiletTrained, scratchPotential },
        },
      },
    });

    this.notificationService.addMessageToQueue(
      {
        createdBy: username,
        slug: animal.slug,
        action: 'create-animal',
      },
      'animal-changed-notification'
    );

    return animal;
  }

  /**
   * Fetches detailed information of a single animal.
   * @param term - Term representing the animal (UUID or slug).
   * @returns Animal entity object.
   * @throws NotFoundError if the animal is not found.
   */
  public async createDog(
    userId: string,
    username: string,
    createDogDto: CreateDogDto
  ) {
    const { departmentAdapted, droolingPotential, bark, city, ...rest } =
      createDogDto;

    const cityData = await prisma.city.findUnique({
      where: { name: city },
    });

    if (!cityData) {
      throw new BadRequestError(`Ciudad '${city}' no encontrada`);
    }

    const slug = await prisma.animal.generateUniqueSlug({
      name: rest.name,
      shelter: username,
    });

    const animal = await prisma.animal.create({
      data: {
        ...rest,
        name: rest.name.toLowerCase(),
        createdBy: userId,
        slug,
        cityId: cityData.id,
        publishStatus: 'published',
        dog: {
          create: { departmentAdapted, droolingPotential, bark },
        },
      },
    });

    // Give time for images to be uploaded

    this.notificationService.addMessageToQueue(
      {
        createdBy: username,
        slug: animal.slug,
        action: 'create-animal',
      },
      'animal-changed-notification'
    );

    return animal;
  }

  /**
   * Fetches detailed information of a single animal.
   * @param term - Term representing the animal (UUID or slug).
   * @returns Animal entity object.
   * @throws NotFoundError if the animal is not found.
   */
  public async getSingle(term: string) {
    const animal = await this.getAnimalFromTerm(term);

    if (!animal) throw new NotFoundError('Animal no encontrado');

    const animalDetail = AnimalEntity.fromObjectDetail(animal);

    return animalDetail;
  }

  /**
   * Fetches a paginated list of animals based on filter criteria.
   * @param paginationDto - DTO containing pagination parameters.
   * @param animalFilterDto - DTO containing animal filter criteria.
   * @returns Object containing paginated list of animals.
   */
  public async getAll(
    paginationDto: PaginationDto,
    animalFilterDto: AnimalFilterDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const filters = await this.mapFilters(animalFilterDto);

    const [adopted, fostered, awaitingHome, total, animals] =
      await prisma.$transaction([
        prisma.animal.count({
          where: {
            ...filters,
            name: filters.name ? { contains: filters.name } : undefined,
            status: 'adopted',
          },
        }),
        prisma.animal.count({
          where: {
            ...filters,
            name: filters.name ? { contains: filters.name } : undefined,
            status: 'fostered',
          },
        }),
        prisma.animal.count({
          where: {
            ...filters,
            name: filters.name ? { contains: filters.name } : undefined,
            status: 'awaiting_home',
          },
        }),
        prisma.animal.count({
          where: {
            AND: {
              ...filters,
              name: filters.name ? { contains: filters.name } : undefined,
              status: { not: 'adopted' },
            },
          },
        }),
        prisma.animal.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: {
            AND: {
              ...filters,
              name: filters.name ? { contains: filters.name } : undefined,
              status: { not: 'adopted' },
            },
          },
          include: {
            shelter: {
              include: {
                user: {
                  select: { avatar: true, username: true, isOnline: true },
                },
              },
            },
            city: true,
            cat: true,
            dog: true,
            userFav: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

    const maxPages = Math.ceil(total / limit);

    const animalsEntity = AnimalEntity.fromArray(animals);

    return {
      currentPage: page,
      maxPages,
      limit,
      total,
      adopted,
      fostered,
      awaitingHome,
      next:
        page + 1 <= maxPages
          ? `/api/animals?page=${page + 1}&limit=${limit}`
          : null,
      prev:
        page - 1 > 0 ? `/api/animals?page=${page - 1}&limit=${limit}` : null,
      animals: animalsEntity,
    };
  }

  /**
   * Sends notifications for an updated animal.
   * @param animalId - ID of the updated animal.
   * @param query - Query object containing notification details.
   */
  private async sendNotifications(
    message: string,
    animalId: string,
    animalSlug: string,
    animalType: string
  ) {
    const favs = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        userFav: true,
        shelter: {
          select: { user: { select: { username: true } } },
        },
      },
    });

    const userData =
      (favs &&
        favs.userFav.map((user) => ({
          email: user.email,
          userId: user.id,
          isOnline: user.isOnline,
          username: user.username,
        }))) ||
      [];

    userData.map((user) => user.userId);

    userData?.forEach(async ({ email, userId, isOnline, username }) => {
      const notification = await prisma.notification.create({
        data: {
          type: 'animal-changed',
          message,
          link: `/animals/${animalType}s/${animalSlug}`,
          userId,
          queue: 'animal-changed-push-notification',
          data: {
            animalSlug,
            animalType,
          },
        },
      });

      this.notificationService.addMessageToQueue(
        {
          ...notification,
          createdBy: favs?.shelter.user.username,
          username,
        },
        'animal-changed-push-notification'
      );

      if (!isOnline)
        this.emailService.addMessageToQueue(
          { link: `animals/${animalType}s/${animalSlug}`, email },
          'animal-changed'
        );
    });
  }

  /**
   * Updates information of an existing animal.
   * @param updateAnimalDto - DTO containing updated animal information.
   * @param user - PayloadUser object representing the user updating the animal.
   * @param term - Term representing the animal (UUID or slug).
   * @returns Updated animal object.
   */
  public async update(
    user: PayloadUser,
    term: string,
    updateAnimalDto: UpdateAnimalDto
  ) {
    const animal = await this.getAnimalFromTerm(term);

    CheckPermissions.check(user, animal.createdBy);

    const updateQuery = await this.buildQuery(updateAnimalDto);

    const updatedAnimal = await prisma.animal.update({
      where: { id: animal.id },
      data: updateQuery,
    });

    await this.sendNotifications(
      `El animal ${updatedAnimal.name.toUpperCase()} de tus favoritos ha cambiado`,
      updatedAnimal.id,
      updatedAnimal.slug,
      updatedAnimal.type
    );

    this.notificationService.addMessageToQueue(
      {
        createdBy: user.name,
        slug: animal.slug,
        action: 'update-animal',
      },
      'animal-changed-notification'
    );

    return updatedAnimal;
  }

  /**
   * Deletes an animal.
   * @param user - PayloadUser object representing the user deleting the animal.
   * @param term - Term representing the animal (UUID or slug).
   */
  public async delete(user: PayloadUser, term: string) {
    const animal = await this.getAnimalFromTerm(term);

    if (!animal) throw new NotFoundError(`Animal no encontrado`);

    CheckPermissions.check(user, animal.createdBy);

    await this.sendNotifications(
      `El animal ${animal.name.toUpperCase()} de tus favoritos ha sido borrado`,
      animal.id,
      animal.slug,
      animal.type
    );

    // Delete animal AdoptionChats
    await prisma.adoptionChat.deleteMany({
      where: {
        animal: {
          some: {
            id: animal.id,
          },
        },
      },
    });

    await prisma.animal.delete({ where: { id: animal.id } });

    const imagesToDelete = animal.images.map((image) => image) || [];

    if (imagesToDelete.length > 0)
      await this.s3Service.deleteFiles(imagesToDelete);

    this.notificationService.addMessageToQueue(
      {
        createdBy: user.name,
        slug: animal.slug,
        action: 'delete-animal',
      },
      'animal-changed-notification'
    );
  }

  /**
   * Updates images of an existing animal.
   * @param term - Term representing the animal (UUID or slug).
   * @param files - Array of files representing new images.
   * @param user - PayloadUser object representing the user updating the images.
   * @param deleteImages - Array of image URLs to delete.
   */
  public async updateImages(
    user: PayloadUser,
    term: string,
    files: Express.MulterS3.File[],
    deleteImages: string[]
  ) {
    const animal = await this.getAnimalFromTerm(term);

    CheckPermissions.check(user, animal.createdBy);

    const images = animal.images;

    const resultImages = await this.buildImages(images, deleteImages, files);

    await prisma.animal.update({
      where: { id: animal.id },
      data: { images: resultImages },
    });

    this.notificationService.addMessageToQueue(
      {
        createdBy: animal.createdBy,
        slug: animal.slug,
        action: 'update-animal',
      },
      'animal-changed-notification'
    );
  }

  /**
   * Adds an animal to user's favorites.
   * @param userId - ID of the user.
   * @param animalId - ID of the animal to add to favorites.
   * @returns Updated animal object.
   */
  public async addFavorite(userId: string, animalId: string) {
    const animal = await prisma.animal.findUnique({ where: { id: animalId } });

    if (!animal) throw new NotFoundError('Animal no encontrado');

    if (animal.createdBy === userId)
      throw new BadRequestError(
        'No puedes añadir un animal propio a favoritos'
      );

    const alreadyFav = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        userFav: {
          where: { id: userId },
        },
      },
    });

    if (alreadyFav && alreadyFav.userFav.length > 0)
      throw new BadRequestError('Ya en favoritos');

    //* TODO: Prisma transition
    await prisma.animal.update({
      where: { id: animalId },
      data: {
        userFav: {
          connect: { id: userId },
        },
      },
    });

    const updatedFavs = await prisma.animal.update({
      where: { id: animalId },
      data: { numFavs: { increment: 1 } },
    });

    return updatedFavs;
  }

  /**
   * Removes an animal from user's favorites.
   * @param userId - ID of the user.
   * @param animalId - ID of the animal to remove from favorites.
   * @returns Updated animal object.
   */
  public async removeFavorite(userId: string, animalId: string) {
    const animal = await prisma.animal.findUnique({ where: { id: animalId } });

    if (!animal) throw new NotFoundError('Animal no encontrado');

    const notFav = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        userFav: {
          where: { id: userId },
        },
      },
    });

    if (notFav && notFav.userFav.length === 0)
      throw new BadRequestError('Aun no está en favoritos');

    //* TODO: Prisma transition

    const [_, updatedFavs] = await prisma.$transaction([
      prisma.animal.update({
        where: { id: animalId },
        data: {
          userFav: {
            disconnect: { id: userId },
          },
        },
      }),
      prisma.animal.update({
        where: { id: animalId },
        data: { numFavs: { decrement: 1 } },
      }),
    ]);

    return updatedFavs;
  }
}
