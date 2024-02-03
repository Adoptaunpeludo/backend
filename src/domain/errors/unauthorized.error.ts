import { HttpCodes } from '../../config/http-status-codes.adapter';
import { CustomAPIError } from './custom-api.error';

export class UnauthorizedError extends CustomAPIError {
  constructor(public message: string) {
    super('Unauthorized', message, HttpCodes.FORBIDDEN);
  }
}
