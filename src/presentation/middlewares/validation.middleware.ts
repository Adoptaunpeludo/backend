import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { RequestHandler } from 'express';
import { BadRequestError } from '../../domain/errors';
import { sanitize } from 'class-sanitizer';

export class ValidationMiddleware {
  static validate(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
      const dtoObj = plainToInstance(type, req.body);
      validate(dtoObj, { skipMissingProperties }).then(
        (errors: ValidationError[]) => {
          if (errors.length > 0) {
            const dtoErrors = errors
              .map((error: ValidationError) =>
                (Object as any).values(error.constraints)
              )
              .join(', ');
            next(new BadRequestError(dtoErrors));
          } else {
            sanitize(dtoObj);
            req.body = dtoObj;
            next();
          }
        }
      );
    };
  }
}
