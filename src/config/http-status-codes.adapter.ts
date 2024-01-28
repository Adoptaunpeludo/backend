import { StatusCodes } from 'http-status-codes';

export class HttpCodes {
  static get OK() {
    return StatusCodes.OK;
  }

  static get NOT_FOUND(): number {
    return StatusCodes.NOT_FOUND;
  }

  static get BAD_REQUEST(): number {
    return StatusCodes.BAD_REQUEST;
  }

  static get UNAUTHORIZED(): number {
    return StatusCodes.UNAUTHORIZED;
  }

  static get FOBIDDEN(): number {
    return StatusCodes.FORBIDDEN;
  }
}
