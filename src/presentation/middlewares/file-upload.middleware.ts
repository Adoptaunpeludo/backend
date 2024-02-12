import { NextFunction, Request, Response } from 'express';
import { S3Service } from '../services/s3.service';

export class FileUploadMiddleware {
  constructor(private readonly s3Service: S3Service) {}

  public single = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    await this.s3Service.uploadSingle('users')(req, res);
    next();
  };
}
