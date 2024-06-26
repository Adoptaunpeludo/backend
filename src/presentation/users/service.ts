import { UUID } from '../../config/uuid.adapter';
import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  AnimalFilterDto,
  BadRequestError,
  NotFoundError,
  PaginationDto,
  UpdateUserDto,
  UserEntity,
} from '../../domain';
import { ShelterFilterDto } from '../../domain/dtos/users/filter-user.dto';
import { UpdateSocialMediaDto } from '../../domain/dtos/users/update-social-media.dto';
import { AnimalEntity } from '../../domain/entities/animals.entity';
import {
  AnimalResponse,
  PayloadUser,
  UserResponse,
  UserRoles,
} from '../../domain/interfaces';
import { CheckPermissions } from '../../utils';
import { QueueService, S3Service } from '../shared/services';

/**
 * UserService class handles user-related operations such as fetching users,
 * updating user information, managing user images, and handling user notifications.
 */
export class UserService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly notificationService: QueueService
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

  private notifyUserChanged(username: string, role: UserRoles, action: string) {
    this.notificationService.addMessageToQueue(
      {
        action,
        username,
        role,
      },
      'user-changed-notification'
    );
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
      user.userFav.forEach(async (animal) => {
        if (deletedAnimalsIds.includes(animal.id)) {
          const notification = await prisma.notification.create({
            data: {
              type: 'animal-changed',
              message: `El animal ${animal.name.toUpperCase()} de tus favoritos ha sido borrado`,
              link: '',
              userId: user.id,
              queue: 'animal-changed-push-notification',
              data: {
                animalSlug: animal.slug,
                animalType: animal.type,
              },
            },
          });
          this.notificationService.addMessageToQueue(
            {
              ...notification,
              username: user.username,
            },
            'animal-changed-push-notification'
          );
        }
      });
    });
  }

  /**
   * Builds the update query for updating user information.
   * @param updateUserDto - DTO containing updated user information.
   * @returns Update query object.
   */
  private async buildQuery(updateUserDto: UpdateUserDto) {
    const updatedAt = new Date();

    const {
      firstName,
      lastName,
      description,
      dni,
      cif,
      facilities,
      legalForms,
      ownVet,
      veterinaryFacilities,
      username,
    } = updateUserDto;

    const updateQuery = {
      updatedAt,
      firstName,
      lastName,
      dni,
      username,
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

  private async mapShelterFilters(shelterFilterDto: ShelterFilterDto) {
    let filters: any = {};

    Object.entries(shelterFilterDto).forEach(([key, value]) => {
      if (key === 'city') return;
      filters[key] = value;
    });

    if (shelterFilterDto.city) {
      const city = await prisma.city.findUnique({
        where: { name: shelterFilterDto.city },
      });

      if (city) {
        filters.cityId = city.id;
      } else {
        throw new NotFoundError(
          `Ciudad ${shelterFilterDto.city} no encontrada`
        );
      }
    }

    return filters;
  }

  /**
   * Fetches all users with detailed information.
   * @returns Array of user entities.
   */
  public async getAll(
    paginationDto: PaginationDto,
    shelterFilterDto: ShelterFilterDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const filters = await this.mapShelterFilters(shelterFilterDto);

    const [total, users] = await prisma.$transaction([
      prisma.user.count({
        where: {
          username: filters.username
            ? { contains: filters.username }
            : undefined,
          role: filters.role,
          contactInfo: { cityId: filters.cityId },
        },
      }),
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          username: filters.username
            ? { contains: filters.username }
            : undefined,
          role: filters.role,
          contactInfo: { cityId: filters.cityId },
        },
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
        },
      }),
    ]);

    const maxPages = Math.ceil(total / limit);
    const userEntities = users.map((user: any) => UserEntity.fromObject(user));

    return {
      currentPage: page,
      maxPages,
      limit,
      total,
      next:
        page + 1 <= maxPages
          ? `/api/users?page=${page + 1}&limit=${limit}`
          : null,
      prev: page - 1 > 0 ? `/api/users?page=${page - 1}&limit=${limit}` : null,
      users: userEntities,
    };
  }

  /**
   * Fetches detailed information of the current user.
   * @param email - Email of the current user.
   * @returns User entity object.
   * @throws NotFoundError if the user is not found.
   */
  public async getCurrentUser({ email, wsToken }: PayloadUser) {
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

    if (!user) throw new NotFoundError('Usuario no encontrado');

    const userEntity = UserEntity.fromObject(user);

    userEntity.wsToken = wsToken;

    return userEntity;
  }

  private async getUserFromTerm(term: string) {
    let user = null;

    const isUUID = UUID.validate(term);

    if (isUUID)
      user = await prisma.user.findUnique({
        where: { id: term },
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

    if (!isUUID)
      user = await prisma.user.findUnique({
        where: { username: term },
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

    return user;
  }

  /**
   * Fetches detailed information of a single user.
   * @param id - ID of the user.
   * @returns User entity object.
   * @throws NotFoundError if the user is not found.
   */
  public async getSingleUser(term: string) {
    const user = await this.getUserFromTerm(term);

    if (!user) throw new NotFoundError('Usuario no encontrado');

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
          userFav: true,
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

    if (!userToDelete) throw new NotFoundError('Usuario no encontrado');

    CheckPermissions.check(user, userToDelete.id);

    await this.notifyDeletedAnimalsToUsers(animalsCreated);

    // Delete user AdoptionChats
    await prisma.adoptionChat.deleteMany({
      where: {
        users: {
          some: {
            id: userToDelete.id,
          },
        },
      },
    });

    // Delete user images
    const imagesToDelete =
      userToDelete.shelter?.images.map((image: string) => image) || [];

    if (imagesToDelete.length > 0)
      await this.s3Service.deleteFiles(imagesToDelete);

    // Decrement numFavs in user favs
    userToDelete.userFav.map(async (animal) => {
      console.log({ animal: animal.name });
      await prisma.animal.update({
        where: { id: animal.id },
        data: {
          numFavs: { decrement: 1 },
        },
      });
    });

    this.notifyUserChanged(
      userToDelete.username,
      userToDelete.role,
      'user-deleted'
    );

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

    if (!user) throw new NotFoundError('Usuario no encontrado');

    if (user) {
      const isValid = prisma.user.validatePassword({
        password: oldPassword,
        hash: user.password,
      });
      if (!isValid) throw new BadRequestError('Password no valido');
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

    if (!userFound) throw new NotFoundError('Usuaro o refugio no encontrados');

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
    const { city, phoneNumber } = updateUserDto;

    const userToUpdate = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!userToUpdate) throw new NotFoundError('Usuario no encontrado');

    CheckPermissions.check(user, userToUpdate.id);

    let cityObj;

    if (city && phoneNumber) {
      cityObj = await prisma.city.findUnique({
        where: { name: city },
      });

      await prisma.contactInfo.upsert({
        where: {
          id: userToUpdate.id,
        },
        update: {
          cityId: cityObj?.id,
          phoneNumber,
        },
        create: {
          cityId: cityObj!.id,
          phoneNumber,
          id: userToUpdate.id,
        },
      });
    }

    const updateQuery = await this.buildQuery(updateUserDto);

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

    if (updatedUser.role === 'shelter')
      this.notifyUserChanged(
        userToUpdate.username,
        updatedUser.role,
        'user-updated'
      );

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
        role: true,
        shelter: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!userToUpdate) throw new NotFoundError('Usuario no encontrado');

    let updateQuery: {
      avatar?: string[];
      shelter?: { update: { images: string[] } };
    } = {};

    if (userToUpdate.role === 'shelter') {
      if (!userToUpdate.shelter)
        throw new NotFoundError('El usuario no es un refugio');

      const images = userToUpdate.shelter.images;
      const resultImages = await this.buildImages(images, deleteImages, files);
      updateQuery.avatar = resultImages.length > 0 ? [resultImages[0]] : [];
      updateQuery.shelter = {
        update: {
          images: resultImages,
        },
      };
    } else {
      const resultImages = await this.buildImages([], deleteImages, files);
      updateQuery.avatar = resultImages.length > 0 ? [resultImages[0]] : [];
    }

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
        orderBy: {
          createdAt: 'desc',
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
        orderBy: {
          createdAt: 'desc',
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
   * @param paginationDto - DTO containing pagination parameters.
   * @returns Object containing paginated list of user's notifications.
   */
  public async getNotifications(id: string, paginationDto: PaginationDto) {
    const { limit = 5, page = 1 } = paginationDto;

    const [total, read, unread, notifications] = await prisma.$transaction([
      prisma.notification.count({ where: { userId: id } }),
      prisma.notification.count({
        where: { AND: { userId: id, isRead: true } },
      }),
      prisma.notification.count({
        where: { AND: { userId: id, isRead: false } },
      }),
      prisma.notification.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const maxPages = Math.ceil(total / limit);

    return {
      currentPage: page,
      maxPages,
      limit,
      total,
      read,
      unread,
      next:
        page + 1 <= maxPages
          ? `/api/users/me/notifications?page=${page + 1}&limit=${limit}`
          : null,
      prev:
        page - 1 > 0
          ? `/api/users/me/notifications?page=${page - 1}&limit=${limit}`
          : null,
      notifications,
    };
  }

  /**
   * Marks a notification as read for a user.
   * @param user - PayloadUser object representing the user.
   * @param id - ID of the notification to mark as read or 'all' to mark all notifications as read
   */
  public async readNotification(user: PayloadUser, id: string) {
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isRead: true,
          isReadAt: new Date(),
        },
      });
      return true;
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) throw new NotFoundError('Notificacion no encontrada');
    if (notification.isRead)
      throw new BadRequestError('La notificacion ya ha sido leida');

    CheckPermissions.check(user, notification.userId);

    await prisma.notification.update({
      where: {
        id: id,
      },
      data: {
        isRead: true,
        isReadAt: new Date(),
      },
    });

    return true;
  }

  public async deleteNotification(user: PayloadUser, id: string) {
    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) throw new NotFoundError('Notificacion no encontrada');

    CheckPermissions.check(user, notification.userId);

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
