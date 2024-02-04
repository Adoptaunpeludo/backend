import { HttpCodes } from '../../config';
import { CustomAPIError } from './custom-api.error';

export class InternalServerError extends CustomAPIError {
  constructor(public message: string) {
    super('Internal Server', message, HttpCodes.INTERNAL_SERVER_ERROR);
  }
}
