import { Request, Response } from 'express';
import { NotFoundMiddleware } from './not-found.middleware';
import { HttpCodes } from '../../config';

describe('not-found.middleware.ts', () => {
  it('should return a 404 status code and a JSON message with the route not found when init method is called with a Request object and a Response object', () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    NotFoundMiddleware.init(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      message: `Route ${req.url} not found`,
    });
  });
});
