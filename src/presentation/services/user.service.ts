import { prisma } from '../../data/postgres';

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
}
