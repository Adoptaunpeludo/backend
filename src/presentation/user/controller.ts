import { Request, Response } from 'express';
import { HttpCodes } from '../../config/http-status-codes.adapter';
import { prisma } from '../../data/postgres';
import { UserEntity } from '../../domain/entities/user.entity';
import { NotFoundError } from '../../domain/errors';

export class UserController {
  constructor() {}

  getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
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

    const userEntities = users.map((user) => UserEntity.fromObject(user));

    res.status(HttpCodes.OK).json(userEntities);
  };

  getUser = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.user.email },
      include: {
        [req.body.user.role]: true,
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
    if (!user) throw new NotFoundError('User not found');
    const userEntity = UserEntity.fromObject(user);
    res.status(HttpCodes.OK).json(userEntity);
  };
}
