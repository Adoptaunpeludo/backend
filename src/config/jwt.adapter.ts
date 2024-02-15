import jwt from 'jsonwebtoken';

import { UserRoles } from '../domain/interfaces/user-response.interface';
import { PayloadUser } from '../domain/interfaces';

export interface JWTAdapterPayload {
  user: PayloadUser;

  refreshToken?: string;
}

export class JWTAdapter {
  constructor(private readonly seed: string) {}

  public generateToken(
    payload: JWTAdapterPayload,

    duration: string = '2h'
  ) {
    return jwt.sign(payload, this.seed, { expiresIn: duration });
  }

  public validateToken(token: string): JWTAdapterPayload {
    return jwt.verify(token, this.seed) as JWTAdapterPayload;
  }
}
