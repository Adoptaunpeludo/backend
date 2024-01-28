import { HttpCodes } from "../../config/http-status-codes.adapter";
import { CustomAPIError } from "./custom-api.error";


export class UnauthenticatedError extends CustomAPIError{
  constructor(public message: string) {
    super('Unauthenticated', message, HttpCodes.UNAUTHORIZED);
  }
}
