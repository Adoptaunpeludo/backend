import { Request, Response } from 'express';
import { HttpCodes } from '../../config/http-status-codes.adapter';

export class NotFoundMiddleware {
  static init(req: Request, res: Response) {
    res
      .status(HttpCodes.NOT_FOUND)
      .json({ message: `Route ${req.url} not found` });
  }
}
