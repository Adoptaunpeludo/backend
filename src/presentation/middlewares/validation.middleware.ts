import { RequestHandler } from 'express';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { sanitize } from 'class-sanitizer';

import { BadRequestError } from '../../domain/errors';
import { AnimalFilterDto, PaginationDto } from '../../domain';

/**
 * Middleware class for request validation.
 */
export class ValidationMiddleware {
  /**
   * Method to validate request data based on a specified DTO class.
   * @param type - The DTO class to validate against.
   * @param skipMissingProperties - Flag to skip missing properties during validation.
   * @returns Express middleware function for request validation.
   */
  static validate(type: any, skipMissingProperties = false): RequestHandler {
    return (req, _res, next) => {
      const body = req.body;
      const user = req.user;
      const { page, limit, ...filters } = req.query;

      let dtoObj = {};

      // Create DTO instance based on the provided type
      if (type.prototype === PaginationDto.prototype)
        dtoObj = plainToInstance(type, { page, limit });
      else if (type.prototype === AnimalFilterDto.prototype)
        dtoObj = plainToInstance(type, filters);
      else dtoObj = plainToInstance(type, body);

      // Validate DTO instance
      validate(dtoObj, {
        skipMissingProperties,
        whitelist: true,
        forbidNonWhitelisted: true,
      }).then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          // Construct error message from validation errors
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

          // Send BadRequestError with validation errors
          next(new BadRequestError(dtoErrors));
        } else {
          // Sanitize DTO object
          sanitize(dtoObj);

          // Update request object based on DTO type
          if (type.prototype === PaginationDto.prototype) {
            req.query = { ...dtoObj, ...filters };
          } else if (type.prototype === AnimalFilterDto.prototype) {
            req.query = { ...dtoObj, ...{ page, limit } };
          } else req.body = dtoObj;

          // Restore user object in request
          req.user = user;
          next();
        }
      });
    };
  }
}
