import { RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { sanitize } from 'class-sanitizer';

import { BadRequestError } from '../../domain/errors';

export class ValidationMiddleware {
  static validate(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
      const dtoObj = plainToInstance(type, req.body);

      console.log({ dtoObj });
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
