import jwt from 'jsonwebtoken';

import { UserRoles } from '../interfaces/user-response.interface';
import { PayloadUser } from '../interfaces';

export interface JWTAdapterPayload {
  user: PayloadUser;

  refreshToken?: string;
}

export class JWTAdapter {
  constructor(private readonly seed: string) {}

  public generateToken(
    payload: JWTAdapterPayload,

    duration: string = '2h'
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(payload, this.seed, { expiresIn: duration }, (err, token) => {
        if (err) return resolve(null);

        if (token) resolve(token);
      });
    });
  }

  public validateToken(token: string): Promise<JWTAdapterPayload | null> {
    return new Promise((resolve) => {
      jwt.verify(token, this.seed, (err, decoded) => {
        if (err) return resolve(null);
        resolve(decoded as JWTAdapterPayload);
      });
    });
  }
}
