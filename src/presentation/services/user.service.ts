import { PrismaClient } from '@prisma/client';
import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  BadRequestError,
  FileUploadDto,
  NotFoundError,
  UpdateUserDto,
  UserEntity,
} from '../../domain';
import { UpdateSocialMediaDto } from '../../domain/dtos/users/update-social-media.dto';
import { PayloadUser, UserRoles } from '../../domain/interfaces';
import { CheckPermissions } from '../../utils';
import { S3Service } from './s3.service';

export class UserService {
  constructor(private readonly s3Service: S3Service) {}

  public async getAllUsers() {
    return await prisma.user.findMany({
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
  }

  public async getCurrentUser(email: string, role: UserRoles) {
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

    return user;
  }

  public async deleteUser(user: PayloadUser) {
    const userToDelete = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!userToDelete) throw new NotFoundError('User not found');

    CheckPermissions.check(user, userToDelete.id);

    await prisma.user.delete({ where: { email: userToDelete.email } });
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

    const images = userToUpdate?.shelter?.images;

    let resultImages: string[] = [];

    if (images)
      resultImages = images.filter((image) => !deleteImages.includes(image));

    if (deleteImages.length > 0) await this.s3Service.deleteFiles(deleteImages);

    let updateQuery: any = {
      shelter: {
        update: {
          images: [],
        },
      },
    };

    if (files && files.length > 0) {
      const uploadedImages = files.map((file) => file.key);
      resultImages = [...resultImages, ...uploadedImages];
    }

    resultImages = resultImages.filter(
      (image, index, array) => array.indexOf(image) === index
    );

    updateQuery.shelter.update.images = resultImages;

    updateQuery.avatar = resultImages[0] ? resultImages[0] : 'avatar.png';

    await prisma.user.update({
      where: {
        email: user.email,
      },
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
  }
}
