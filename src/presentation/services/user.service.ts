import { prisma } from '../../data/postgres';
import { NotFoundError } from '../../domain';
import { PayloadUser, UserRoles } from '../../interfaces';
import { CheckPermissions } from '../../utils';

export class UserService {
  constructor() {}

  public async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        admin: true,
        adopter: true,
        contactInfo: {
          include: {
            city: true,
          },
        },
        shelter: {
          include: {
            socialMedia: true,
          },
        },
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

  public async deleteUser(user: PayloadUser, email: string) {
    const userToDelete = await prisma.user.findUnique({ where: { email } });

    if (!userToDelete) throw new NotFoundError('User not found');

    CheckPermissions.check(user, userToDelete.id);

    await prisma.user.delete({ where: { email } });
  }
}
