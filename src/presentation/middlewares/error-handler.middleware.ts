import { NextFunction, Request, Response } from 'express';

import { CustomAPIError } from '../../domain/errors';
import { HttpCodes, envs } from '../../config';
import { MulterError } from 'multer';
import { QueueService } from '../common/services';

/**
 * Middleware class for handling errors.
 */
export class ErrorHandlerMiddleware {
  errorLogsService: QueueService = new QueueService(
    envs.RABBITMQ_URL,
    'error-notification'
  );

  /**
   * Handles errors and sends appropriate responses.
   */
  constructor() {}

  handle = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log({ err });

    let message, statusCode;

    // Handle unknown errors
    if (!err || err === null) {
      statusCode = 500;
      message = 'Unknown error';
    }

    // Handle CustomAPIError
    if (err instanceof CustomAPIError) {
      statusCode = err.statusCode;
      message = err.message;
    }

    // Handle MulterError
    if (err instanceof MulterError) {
      statusCode = HttpCodes.BAD_REQUEST;
      message = err.message;
    }

    this.errorLogsService.addMessageToQueue(
      {
        message: message,
        level: statusCode === 500 ? 'high' : 'medium',
        origin: 'backend',
      },
      'error-logs'
    );

    return res.status(statusCode || HttpCodes.INTERNAL_SERVER_ERROR).json({
      name: err?.name || 'Error',
      message: message || err?.message,
    });
  };
}
