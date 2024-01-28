import { StatusCodes } from 'http-status-codes';

export class HttpCodes {
  static get OK() {
    return StatusCodes.OK;
  }

  static get NOT_FOUND(): number {
    return StatusCodes.NOT_FOUND;
  }
}
