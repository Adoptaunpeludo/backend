import { UnauthorizedError } from '../domain';
import { PayloadUser } from '../domain/interfaces';

export class CheckPermissions {
  static check(requestUser: PayloadUser, resourceUserId: string) {
    if (requestUser.role === 'admin') return;
    if (requestUser.id === resourceUserId.toString()) return;
    throw new UnauthorizedError('Not authorized to access this route');
  }
}
