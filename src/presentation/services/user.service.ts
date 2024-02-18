import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  AnimalFilterDto,
  BadRequestError,
  FileUploadDto,
  NotFoundError,
  PaginationDto,
  UpdateUserDto,
  UserEntity,
} from '../../domain';
import { UpdateSocialMediaDto } from '../../domain/dtos/users/update-social-media.dto';
import { AnimalEntity } from '../../domain/entities/animals.entity';
import { PayloadUser, UserRoles } from '../../domain/interfaces';
import { CheckPermissions } from '../../utils';
import { S3Service } from './s3.service';

export class UserService {
  constructor(private readonly s3Service: S3Service) {}

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

  public async deleteUser(user: PayloadUser) {
    const userToDelete = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        shelter: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!userToDelete) throw new NotFoundError('User not found');

    CheckPermissions.check(user, userToDelete.id);

    await prisma.user.delete({ where: { email: userToDelete.email } });

    const imagesToDelete =
      userToDelete.shelter?.images.map((image: string) => image) || [];

    if (imagesToDelete.length > 0)
      await this.s3Service.deleteFiles(imagesToDelete);
  }

  public async changePassword(
    oldPassword: string,
    newPassword: string,
    userId: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

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

  async getFavorites(
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
}
