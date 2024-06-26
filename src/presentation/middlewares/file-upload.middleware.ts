import { NextFunction, Request, Response } from 'express';
import { S3Service } from '../shared/services/s3.service';

import { BadRequestError, NotFoundError } from '../../domain';
import { CheckPermissions } from '../../utils';
import { prisma } from '../../data/postgres/index';

/**
 * Middleware class for handling file uploads.
 */
export class FileUploadMiddleware {
  /**
   * Constructor to inject dependencies.
   * @param s3Service - The S3Service instance.
   */
  constructor(private readonly s3Service: S3Service) {}

  // public multiUpload = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   const user = await prisma.user.findUnique({
  //     where: { email: req.user.email },
  //   });

  //   if (!user) throw new NotFoundError('User not found');

  //   CheckPermissions.check(req.user, user.id);

  //   if (user.avatar.startsWith('users')) this.s3Service.deleteFile(user.avatar);

  //   await this.s3Service.uploadSingle('users')(req, res);
  //   await this.s3Service.uploadMultiple('users')(req, res);

  //   next();
  // };

  // public single = async (req: Request, res: Response, next: NextFunction) => {
  //   const user = await prisma.user.findUnique({
  //     where: { email: req.user.email },
  //   });

  //   if (!user) throw new NotFoundError('User not found');

  //   CheckPermissions.check(req.user, user.id);

  //   if (user.avatar.startsWith('users')) this.s3Service.deleteFile(user.avatar);

  //   await this.s3Service.uploadSingle('users')(req, res);
  //   next();
  // };

  /**
   * Middleware function for handling multiple file uploads.
   * @param resource - The type of resource ('users' or 'animals').
   * @returns Middleware function.
   */
  public multiple =
    (resource: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const { term } = req.params;

      let user, animal, id: string, name: string, resourceId: string;

      switch (resource) {
        case 'users':
          user = await prisma.user.findUnique({
            where: { email: req.user.email },
            include: { shelter: { select: { images: true } } },
          });

          if (!user) throw new NotFoundError('Usuario no encontrado');

          name = user.username;
          id = user.id;
          resourceId = user.id;
          break;

        case 'animals':
          animal = await prisma.animal.findUnique({
            where: {
              id: term,
            },
            select: {
              id: true,
              images: true,
              createdBy: true,
              name: true,
            },
          });
          if (!animal) throw new NotFoundError('Animal no encontrado');
          name = animal.name;
          id = animal.createdBy;
          resourceId = animal.id;
          break;

        default:
          throw new BadRequestError(
            `Recurso invalido: ${resource}, validos: users, animals`
          );
      }

      CheckPermissions.check(req.user, id);

      await this.s3Service.uploadMultiple(resource, resourceId, name)(req, res);
      next();
    };
}
