import { NextFunction, Request, Response } from 'express';

export class ErrorHandlerMiddleware {
  static handle(err: Error, _req: Request, res: Response, _next: NextFunction) {
    console.log(err);

    let msg, statusCode;
  }
}
