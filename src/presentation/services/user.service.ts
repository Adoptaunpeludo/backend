import { BcryptAdapter } from '../../config';
import { prisma } from '../../data/postgres';
import { BadRequestError, NotFoundError, UpdateUserDto } from '../../domain';
import { UpdateSocialMediaDto } from '../../domain/dtos/update-social-media.dto';
import { PayloadUser, UserRoles } from '../../interfaces';
import { CheckPermissions } from '../../utils';

export class UserService {
  constructor() {}

  public async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        admin: true,
        shelter: {
          include: {
            socialMedia: true,
          },
        },
        contactInfo: true,
      },
    });
  }

  public async getCurrentUser(email: string, role: UserRoles) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        [role]: true,
        contactInfo: {
          include: {
            city: true,
          },
        },
        shelter: {
          include: { socialMedia: true },
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
      const isValid = BcryptAdapter.compare(oldPassword, user.password);
      if (!isValid) throw new BadRequestError('Invalid password');
      const hashPassword = BcryptAdapter.hash(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashPassword },
      });
    }
  }

  public async updateSocialMedia(
    socialMediaDto: UpdateSocialMediaDto,
    email: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundError('User or shelter not found');

    console.log({ socialMediaDto });

    const promises = socialMediaDto.socialMedia.map((socialMediaItem) =>
      prisma.socialMedia.upsert({
        where: {
          shelterId_name: {
            name: socialMediaItem.name,
            shelterId: user.id,
          },
        },
        update: {
          url: socialMediaItem.url,
        },
        create: {
          name: socialMediaItem.name,
          url: socialMediaItem.url,
          shelter: {
            connect: {
              id: user.id,
            },
          },
        },
      })
    );

    await Promise.all(promises);
  }

  public async updateUser(
    updateUserDto: UpdateUserDto,
    payloadUser: PayloadUser,
    email: string
  ) {
    const userToUpdate = await prisma.user.findUnique({ where: { email } });

    if (!userToUpdate) throw new NotFoundError('User not found');

    CheckPermissions.check(payloadUser, userToUpdate.id);

    const {
      username,
      firstName,
      lastName,
      name,
      description,
      phoneNumber,
      address,
      cityId,
    } = updateUserDto;

    const updateQuery: any = {};

    if (username) updateQuery.username = username;
    if (firstName || lastName) {
      updateQuery.adopter = {
        update: {
          firstName,
          lastName,
        },
      };
    }
    if (name || description) {
      updateQuery.shelter = {
        update: {
          name,
          description,
        },
      };
    }
    if (phoneNumber || address || cityId) {
      updateQuery.contactInfo = {
        update: {
          ...(phoneNumber && { phoneNumber }),
          ...(address && { address }),
          ...(cityId && { cityId: +cityId }),
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateQuery,
    });

    return updatedUser;
  }
}
