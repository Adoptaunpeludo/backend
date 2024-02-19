import { UnauthorizedError } from '../domain';
import { PayloadUser } from '../domain/interfaces';

/**
 * Utility class for checking user permissions.
 */
export class CheckPermissions {
  /**
   * Method to check user permissions for accessing a resource.
   * @param requestUser - The user object extracted from the request.
   * @param resourceUserId - The user ID associated with the resource.
   * @throws UnauthorizedError if the user is not authorized to access the resource.
   */
  static check(requestUser: PayloadUser, resourceUserId: string) {
    // Check if user is an admin or the owner of the resource
    if (requestUser.role === 'admin') return;
    if (requestUser.id === resourceUserId.toString()) return;

    // Throw UnauthorizedError if user does not have permission
    throw new UnauthorizedError('Not authorized to access this route');
  }
}
