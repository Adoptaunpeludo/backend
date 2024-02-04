import { NextFunction, Request, Response } from 'express';
import { CustomAPIError } from '../../domain/errors';
import { HttpCodes } from '../../config';

export class ErrorHandlerMiddleware {
  static handle(err: Error, _req: Request, res: Response, _next: NextFunction) {
    console.log({ err });

    let message, statusCode;

    if (err instanceof CustomAPIError) {
      statusCode = err.statusCode;
      message = err.message;
    }

    return res.status(statusCode || HttpCodes.INTERNAL_SERVER_ERROR).json({
      name: err.name,
      message: message || err.message,
    });
  }
}
