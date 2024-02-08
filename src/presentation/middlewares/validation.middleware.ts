import { RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { sanitize } from 'class-sanitizer';

import { BadRequestError } from '../../domain/errors';

export class ValidationMiddleware {
  static validate(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
      const { user, ...updates } = req.body;

      const dtoObj = plainToInstance(type, updates);
      
      validate(dtoObj, {
        skipMissingProperties,
        whitelist: true,
        forbidNonWhitelisted: true,
      }).then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const dtoErrors = errors
            .flatMap((error: ValidationError) => {
              if (error.children && error.children.length > 0) {
                return error.children.flatMap((child) =>
                  child.children?.flatMap((child) =>
                    (Object as any).values(child.constraints)
                  )
                );
              } else {
                return (Object as any).values(error.constraints);
              }
            })
            .join(', ');
          next(new BadRequestError(dtoErrors));
        } else {
          sanitize(dtoObj);
          req.body = dtoObj;
          req.body.user = user;
          next();
        }
      });
    };
  }
}
