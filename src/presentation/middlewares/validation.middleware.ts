import { RequestHandler } from 'express';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { sanitize } from 'class-sanitizer';

import { BadRequestError } from '../../domain/errors';
import { AnimalFilterDto, PaginationDto } from '../../domain';

export class ValidationMiddleware {
  static validate(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
      const { user, ...body } = req.body;
      const { page, limit, ...filters } = req.query;

      let dtoObj = {};

      if (type.prototype === PaginationDto.prototype)
        dtoObj = plainToInstance(type, { page, limit });
      else if (type.prototype === AnimalFilterDto.prototype)
        dtoObj = plainToInstance(type, filters);
      else dtoObj = plainToInstance(type, body);

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

          // throw new BadRequestError(dtoErrors);
          // res.status(HttpCodes.BAD_REQUEST).json({ message: dtoErrors });
          next(new BadRequestError(dtoErrors));
        } else {
          sanitize(dtoObj);
          if (type.prototype === PaginationDto.prototype) {
            req.query = { ...dtoObj, ...filters };
          } else if (type.prototype === AnimalFilterDto.prototype) {
            req.query = { ...dtoObj, ...{ page, limit } };
          } else req.body = dtoObj;

          req.body.user = user;
          next();
        }
      });
    };
  }
}
