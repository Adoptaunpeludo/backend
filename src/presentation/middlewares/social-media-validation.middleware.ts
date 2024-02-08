import { Request, Response, NextFunction } from 'express';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SocialMediaDto, UpdateSocialMediaDto } from '../../domain/dtos';

export class SocialMediaValidation {
  static async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const updateSocialMediaDto = plainToInstance(
        SocialMediaDto,
        req.body.socialMedia
      );
      
      const errors = await validate(updateSocialMediaDto);
      
      if (errors.length > 0) {
        const validationErrors = errors
          .map((error) => (Object as any).values(error.constraints))
          .join(', ');
        return res.status(400).json({ message: validationErrors });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
