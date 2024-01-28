import { HttpCodes } from '../../config/http-status-codes.adapter';
import { CustomAPIError } from './custom-api.error';

export class NotFoundError extends CustomAPIError {
  constructor(public message: string) {
    super('Not Found', message, HttpCodes.NOT_FOUND);
  }
}
