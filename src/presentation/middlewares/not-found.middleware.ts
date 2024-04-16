import { Request, Response } from 'express';

import { HttpCodes } from '../../config';

/**
 * Middleware class for handling not found routes.
 */
export class NotFoundMiddleware {
  static init(req: Request, res: Response) {
    res
      .status(HttpCodes.NOT_FOUND)
      .json({ message: `Ruta ${req.url} no encontrada` });
  }
}
