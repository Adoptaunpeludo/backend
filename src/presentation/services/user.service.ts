import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  BadRequestError,
  NotFoundError,
  UpdateUserDto,
  UserEntity,
} from '../../domain';
import { UpdateSocialMediaDto } from '../../domain/dtos/users/update-social-media.dto';
import { PayloadUser, UserRoles } from '../../domain/interfaces';
import { CheckPermissions } from '../../utils';

export class UserService {
  constructor() {}

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

  public async deleteUser(payloadUser: PayloadUser, email: string) {
    const userToDelete = await prisma.user.findUnique({ where: { email } });

    if (!userToDelete) throw new NotFoundError('User not found');

    CheckPermissions.check(payloadUser, userToDelete.id);

    await prisma.user.delete({ where: { email } });
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

  public async updateUser(
    updateUserDto: UpdateUserDto,
    payloadUser: PayloadUser,
    email: string
  ) {
    const userToUpdate = await prisma.user.findUnique({ where: { email } });

    if (!userToUpdate) throw new NotFoundError('User not found');

    CheckPermissions.check(payloadUser, userToUpdate.id);

    const updateQuery = this.buildQuery(updateUserDto);

    const updatedUser = await prisma.user.update({
      where: { email },
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
}
