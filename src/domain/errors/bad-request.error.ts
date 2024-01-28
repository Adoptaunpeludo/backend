import { HttpCodes } from '../../config/http-status-codes.adapter';
import { CustomAPIError } from './custom-api.error';

export class BadRequestError extends CustomAPIError {
  constructor(public message: string) {
    super('Bad Request', message, HttpCodes.BAD_REQUEST);
  }
}
