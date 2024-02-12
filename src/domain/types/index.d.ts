import { PayloadUser } from '../interfaces';
export {};

declare global {
  namespace Express {
    interface Request {
      user: PayloadUser;
    }
  }
}
