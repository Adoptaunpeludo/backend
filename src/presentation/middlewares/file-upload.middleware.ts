import { NextFunction, Request, Response } from 'express';
import { S3Service } from '../services/s3.service';

import { NotFoundError } from '../../domain';
import { CheckPermissions } from '../../utils';
import { prisma } from '../../data/postgres/index';

export class FileUploadMiddleware {
  constructor(private readonly s3Service: S3Service) {}

  public multiUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) throw new NotFoundError('User not found');

    CheckPermissions.check(req.user, user.id);

    if (user.avatar.startsWith('users')) this.s3Service.deleteFile(user.avatar);

    await this.s3Service.uploadSingle('users')(req, res);
    await this.s3Service.uploadMultiple('users')(req, res);

    next();
  };

  public single = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) throw new NotFoundError('User not found');

    CheckPermissions.check(req.user, user.id);

    if (user.avatar.startsWith('users')) this.s3Service.deleteFile(user.avatar);

    await this.s3Service.uploadSingle('users')(req, res);
    next();
  };

  public multiple = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: { shelter: { select: { images: true } } },
    });

    if (!user) throw new NotFoundError('User not found');

    CheckPermissions.check(req.user, user.id);

    if (user.shelter?.images && user.shelter.images.length > 0)
      await this.s3Service.deleteFiles(user.shelter.images);

    await this.s3Service.uploadMultiple('users')(req, res);
    next();
  };
}
