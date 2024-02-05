import { Request, Response } from 'express';

import { HttpCodes } from '../../config';

export class NotFoundMiddleware {
  static init(req: Request, res: Response) {
    res
      .status(HttpCodes.NOT_FOUND)
      .json({ message: `Route ${req.url} not found` });
  }
}
