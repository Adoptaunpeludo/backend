import { Request, Response } from 'express';
import { HttpCodes } from '../../config/http-status-codes.adapter';
import { prisma } from '../../data/postgres';

export class UserController {
  constructor() {}

  getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      include: {
        admin: true,
        adopter: true,
        contactInfo: true,
        shelter: {
          include: {
            socialMedia: true,
          },
        },
      },
    });

    res.status(HttpCodes.OK).json({ users });
  };

  getUser = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { email: 'adopter@example.com' },
      include: {
        adopter: true,
        contactInfo: {
          include: {
            city: true,
          },
        },
      },
    });

    res.status(HttpCodes.OK).json({ user });
  };
}
