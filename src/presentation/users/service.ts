import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  AnimalFilterDto,
  BadRequestError,
  NotFoundError,
  PaginationDto,
  UpdateUserDto,
  UserEntity,
} from '../../domain';
import { UpdateSocialMediaDto } from '../../domain/dtos/users/update-social-media.dto';
import { AnimalEntity } from '../../domain/entities/animals.entity';
import { AnimalResponse, PayloadUser } from '../../domain/interfaces';
import { CheckPermissions } from '../../utils';
import { ProducerService, S3Service } from '../common/services';

/**
 * UserService class handles user-related operations such as fetching users,
 * updating user information, managing user images, and handling user notifications.
 */
export class UserService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly notificationService: ProducerService
  ) {}

  /**
   * Builds the array of images for a user's profile based on input files and existing images.
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
   * Notifies users about deleted animals they have favorited.
   * @param animalsCreatedByDeletedUser - Array of animals created by user about to be deleted.
   */
  private async notifyDeletedAnimalsToUsers(
    animalsCreatedByDeletedUser: AnimalResponse[]
  ) {
    const deletedAnimalsIds = animalsCreatedByDeletedUser.map(
      (animal) => animal.id
    );

    const usersWithFavs = await prisma.user.findMany({
      where: {
        userFav: {
          some: {
            id: {
              in: deletedAnimalsIds,
            },
          },
        },
      },
      include: {
        userFav: true,
      },
    });

    usersWithFavs.forEach((user) => {
      user.userFav.forEach((animal) => {
        if (deletedAnimalsIds.includes(animal.id))
          this.notificationService.addMessageToQueue(
            {
              message: `Animal with id: ${animal.id} and name: ${animal.name} was deleted`,
              userId: user.id,
            },
            'animal-changed-push-notification'
          );
      });
    });
  }

  /**
   * Builds the update query for updating user information.
   * @param updateUserDto - DTO containing updated user information.
   * @returns Update query object.
   */
  private buildQuery(updateUserDto: UpdateUserDto) {
    const updatedAt = new Date();

    const {
      username,
      firstName,
      lastName,
      description,
      phoneNumber,
      address,
      cityId,
      dni,
      cif,
      facilities,
      legalForms,
      ownVet,
      veterinaryFacilities,
    } = updateUserDto;

    const updateQuery: any = {
      updatedAt,
      username,
      firstName,
      lastName,
      dni,
      contactInfo: {
        update: {
          phoneNumber,
          address,
          cityId: cityId && +cityId,
        },
      },
      shelter: {
        update: {
          description,
          cif,
          facilities,
          legalForms,
          ownVet,
          veterinaryFacilities,
        },
      },
    };

    if (ownVet !== undefined) {
      updateQuery.shelter.update.ownVet = ownVet;
    }

    if (veterinaryFacilities !== undefined) {
      updateQuery.shelter.update.veterinaryFacilities = veterinaryFacilities;
    }

    return updateQuery;
  }

  /**
   * Maps animal filter DTO to Prisma compatible filter object.
   * @param animalFilterDto - DTO containing animal filter criteria.
   * @returns Prisma compatible filter object.
   */
  private mapFilters(animalFilterDto: AnimalFilterDto) {
    let filters: any = {};

    Object.entries(animalFilterDto).forEach(([key, value]) => {
      if (key === 'age') {
        if (value === 'puppy') filters.age = { gte: 0, lte: 2 };
        if (value === 'adult') filters.age = { gte: 2, lte: 10 };
        if (value === 'senior') filters.age = { gt: 10 };
      }
      filters[key] = value;
    });

    return filters;
  }

  /**
   * Fetches all users with detailed information.
   * @returns Array of user entities.
   */
  public async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        shelter: {
          include: {
            socialMedia: true,
          },
        },
        contactInfo: {
          include: {
            city: true,
          },
        },
        animals: true,
      },
    });

    const userEntities = users.map((user: any) => UserEntity.fromObject(user));

    return userEntities;
  }

  /**
   * Fetches detailed information of the current user.
   * @param email - Email of the current user.
   * @returns User entity object.
   * @throws NotFoundError if the user is not found.
   */
  public async getCurrentUser(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        contactInfo: {
          include: {
            city: true,
          },
        },
        shelter: {
          include: {
            socialMedia: true,
            animals: { include: { cat: true, dog: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundError('User not found');

    const userEntity = UserEntity.fromObject(user);

    return userEntity;
  }

  /**
   * Fetches detailed information of a single user.
   * @param id - ID of the user.
   * @returns User entity object.
   * @throws NotFoundError if the user is not found.
   */
  public async getSingleUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        contactInfo: {
          include: {
            city: true,
          },
        },
        shelter: {
          include: {
            socialMedia: true,
            animals: { include: { cat: true, dog: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundError('User not found');

    const userEntity = UserEntity.fromObject(user);

    return userEntity;
  }

  /**
   * Deletes a user and associated data.
   * @param user - PayloadUser object representing the user to delete.
   * @throws NotFoundError if the user is not found.
   */
  public async deleteUser(user: PayloadUser) {
    const [userToDelete, animalsCreated] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { email: user.email },
        include: {
          shelter: {
            select: {
              images: true,
            },
          },
        },
      }),
      prisma.animal.findMany({
        where: {
          createdBy: user.id,
        },
        include: {
          cat: true,
          dog: true,
        },
      }),
    ]);

    if (!userToDelete) throw new NotFoundError('User not found');

    CheckPermissions.check(user, userToDelete.id);

    await this.notifyDeletedAnimalsToUsers(animalsCreated);

    const imagesToDelete =
      userToDelete.shelter?.images.map((image: string) => image) || [];

    if (imagesToDelete.length > 0)
      await this.s3Service.deleteFiles(imagesToDelete);

    await prisma.user.delete({ where: { email: userToDelete.email } });
  }

  /**
   * Changes the password for a user.
   * @param oldPassword - Current password of the user.
   * @param newPassword - New password to set.
   * @param userId - ID of the user.
   * @throws NotFoundError if the user is not found.
   */
  public async changePassword(
    oldPassword: string,
    newPassword: string,
    userId: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundError('User not found');

    if (user) {
      const isValid = prisma.user.validatePassword({
        password: oldPassword,
        hash: user.password,
      });
      if (!isValid) throw new BadRequestError('Invalid password');
      const hashPassword = prisma.user.hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashPassword },
      });
    }
  }

  /**
   * Updates social media information for a user.
   * @param socialMediaDto - DTO containing updated social media information.
   * @param user - PayloadUser object representing the user.
   * @throws NotFoundError if the user or shelter is not found.
   */
  public async updateSocialMedia(
    socialMediaDto: UpdateSocialMediaDto,
    user: PayloadUser
  ) {
    const userFound = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!userFound) throw new NotFoundError('User or shelter not found');

    CheckPermissions.check(user, userFound.id);

    const promises = socialMediaDto.socialMedia.map((socialMediaItem) =>
      prisma.socialMedia.upsert({
        where: {
          shelterId_name: {
            name: socialMediaItem.name,
            shelterId: userFound.id,
          },
        },
        update: {
          url: socialMediaItem.url,
        },
        create: {
          name: socialMediaItem.name,
          url: socialMediaItem.url || '',
          shelter: {
            connect: {
              id: userFound.id,
            },
          },
        },
      })
    );

    await Promise.all(promises);
  }

  /**
   * Updates user information.
   * @param updateUserDto - DTO containing updated user information.
   * @param user - PayloadUser object representing the user.
   * @returns Updated user entity object.
   * @throws NotFoundError if the user is not found.
   */
  public async updateUser(updateUserDto: UpdateUserDto, user: PayloadUser) {
    const userToUpdate = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!userToUpdate) throw new NotFoundError('User not found');

    CheckPermissions.check(user, userToUpdate.id);

    const updateQuery = this.buildQuery(updateUserDto);

    const updatedUser = await prisma.user.update({
      where: { email: userToUpdate.email },
      data: updateQuery,
      include: {
        contactInfo: {
          include: {
            city: true,
          },
        },
        shelter: {
          include: {
            socialMedia: true,
            animals: { include: { cat: true, dog: true } },
          },
        },
        animals: true,
      },
    });

    const userEntity = UserEntity.fromObject(updatedUser);

    return userEntity;
  }

  /**
   * Updates user images.
   * @param files - Array of files representing new images.
   * @param user - PayloadUser object representing the user.
   * @param deleteImages - Array of image URLs to delete.
   * @throws NotFoundError if the user is not found.
   * @throws BadRequestError if the user is not a shelter.
   */
  public async updateImages(
    files: Express.MulterS3.File[],
    user: PayloadUser,
    deleteImages: string[]
  ) {
    const userToUpdate = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        shelter: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!userToUpdate) throw new NotFoundError('User not found');

    if (!userToUpdate.shelter)
      throw new BadRequestError('User is not a shelter');

    const images = userToUpdate.shelter.images;

    let updateQuery: {
      avatar: string;
      shelter: { update: { images: string[] } };
    } = {
      avatar: 'avatar.png',
      shelter: {
        update: {
          images: [],
        },
      },
    };

    const resultImages = await this.buildImages(images, deleteImages, files);

    updateQuery.shelter.update.images = resultImages;

    updateQuery.avatar = resultImages[0] ? resultImages[0] : updateQuery.avatar;

    await prisma.user.update({
      where: { email: user.email },
      data: updateQuery,
    });
  }

  /**
   * Fetches favorites user animals.
   * @param user - PayloadUser object representing the user.
   * @param paginationDto - DTO containing pagination parameters.
   * @param animalFilterDto - DTO containing animal filter criteria.
   * @returns Object containing paginated list of favorite animals.
   */
  public async getFavorites(
    user: PayloadUser,
    paginationDto: PaginationDto,
    animalFilterDto: AnimalFilterDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const filters = this.mapFilters(animalFilterDto);

    const [total, animals] = await prisma.$transaction([
      prisma.animal.count({ where: { ...filters, createdBy: user.id } }),
      prisma.animal.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          ...filters,
          userFav: { some: { id: user.id } },
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
        },
      }),
    ]);

    const maxPages = Math.ceil(total / limit);

    const animalsEntities = AnimalEntity.fromArray(animals);

    return {
      currentPage: page,
      maxPages,
      limit,
      total,
      next:
        page + 1 <= maxPages
          ? `/api/animals?page=${page + 1}&limit=${limit}`
          : null,
      prev:
        page - 1 > 0 ? `/api/animals?page=${page - 1}&limit=${limit}` : null,
      animals: animalsEntities,
    };
  }

  /**
   * Fetches animals created by a user.
   * @param id - ID of the user.
   * @param paginationDto - DTO containing pagination parameters.
   * @param animalFilterDto - DTO containing animal filter criteria.
   * @returns Object containing paginated list of user's animals.
   */
  public async getUserAnimals(
    id: string,
    paginationDto: PaginationDto,
    animalFilterDto: AnimalFilterDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const filters = this.mapFilters(animalFilterDto);

    const [total, animals] = await prisma.$transaction([
      prisma.animal.count({ where: { ...filters, createdBy: id } }),
      prisma.animal.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          ...filters,
          createdBy: id,
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
        },
      }),
    ]);

    const maxPages = Math.ceil(total / limit);

    const animalsEntities = AnimalEntity.fromArray(animals);

    return {
      currentPage: page,
      maxPages,
      limit,
      total,
      next:
        page + 1 <= maxPages
          ? `/api/animals?page=${page + 1}&limit=${limit}`
          : null,
      prev:
        page - 1 > 0 ? `/api/animals?page=${page - 1}&limit=${limit}` : null,
      animals: animalsEntities,
    };
  }

  /**
   * Fetches notifications for a user.
   * @param id - ID of the user.
   * @returns Array of notification objects.
   */
  public async getNotifications(id: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: id,
      },
    });

    return notifications;
  }
}
