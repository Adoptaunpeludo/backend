import { NextFunction, Request, Response } from 'express';

import { CustomAPIError } from '../../domain/errors';
import { HttpCodes } from '../../config';

export class ErrorHandlerMiddleware {
  static handle() {
    return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
      let message, statusCode;

      if (!err || err === null) {
        statusCode = 500;
        message = 'Unknown error';
      }

      if (err instanceof CustomAPIError) {
        statusCode = err.statusCode;
        message = err.message;
      }

      return res.status(statusCode || HttpCodes.INTERNAL_SERVER_ERROR).json({
        name: err?.name || 'Error',
        message: message || err?.message,
      });
    };

  }
}
