import { NextFunction, Request, Response } from 'express';
import { ErrorHandlerMiddleware } from '../../../presentation/middlewares/error-handler.middleware';
import { HttpCodes } from '../../../config';

describe('error-handler.middleware.ts', () => {
  test('should return internal server error and error message when receiving an unknown error', () => {
    const err = new Error('Unknown error');
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    ErrorHandlerMiddleware.handle(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      name: 'Error',
      message: 'Unknown error',
    });
  });

  test('should handle null or undefined error object', () => {
    const err = null as unknown as Error;
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    ErrorHandlerMiddleware.handle(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      name: 'Error',
      message: 'Unknown error',
    });
  });
});
