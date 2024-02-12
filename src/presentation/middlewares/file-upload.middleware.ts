import { NextFunction, Request, Response } from 'express';
import { S3Service } from '../services/s3.service';

import { NotFoundError } from '../../domain';
import { CheckPermissions } from '../../utils';
import { prisma } from '../../data/postgres/index';

export class FileUploadMiddleware {
  constructor(private readonly s3Service: S3Service) {}

  public single = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) throw new NotFoundError('User not found');

    if (user.avatar.startsWith('users')) this.s3Service.deleteFile(user.avatar);

    CheckPermissions.check(req.user, user.id);

    await this.s3Service.uploadSingle('users')(req, res);
    next();
  };
}
