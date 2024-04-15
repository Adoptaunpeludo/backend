import { Request, Response } from 'express';
import { HttpCodes } from '../../config/http-status-codes.adapter';
import { UserService } from './service';

/**
 * Controller class for handling user-related HTTP requests.
 */
export class UserController {
  /**
   * Constructs an instance of UserController.
   * @param userService - Instance of UserService for handling user-related operations.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves all users.
   */
  getAllUsers = async (req: Request, res: Response) => {
    const { limit = 10, page = 1, ...filters } = req.query;

    const { users, ...pagination } = await this.userService.getAll(
      { limit: +limit, page: +page },
      filters
    );

    res.status(HttpCodes.OK).json({ ...pagination, users });
  };

  /**
   * Retrieves the current user.
   */
  getCurrentUser = async (req: Request, res: Response) => {
    const user = await this.userService.getCurrentUser(req.user);

    res.status(HttpCodes.OK).json(user);
  };

  /**
   * Retrieves a single user by ID.
   */
  getSingleUser = async (req: Request, res: Response) => {
    const { term } = req.params;

    const user = await this.userService.getSingleUser(term);

    res.status(HttpCodes.OK).json(user);
  };

  /**
   * Deletes the current user.
   */
  deleteUser = async (req: Request, res: Response) => {
    await this.userService.deleteUser(req.user);

    res.cookie('refreshToken', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    res.cookie('accessToken', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    res.status(HttpCodes.OK).json({ message: 'User deleted successfully' });
  };

  /**
   * Updates user information.
   */
  updateUser = async (req: Request, res: Response) => {
    const updates = req.body;
    const { user } = req;

    const updatedUser = await this.userService.updateUser(updates, user);

    res.status(HttpCodes.OK).json(updatedUser);
  };

  /**
   * Changes the user's password.
   */
  changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    await this.userService.changePassword(oldPassword, newPassword, id!);

    res.status(HttpCodes.OK).json({ message: 'Password updated' });
  };

  /**
   * Updates user's social media information.
   */
  updateSocialMedia = async (req: Request, res: Response) => {
    const updates = req.body;
    const user = req.user;

    await this.userService.updateSocialMedia(updates, user);

    res
      .status(HttpCodes.OK)
      .json({ message: 'Social media updated successfully' });
  };

  /**
   * Uploads user images.
   */
  uploadImages = async (req: Request, res: Response) => {
    const { files, user } = req;
    const { deleteImages } = req.body;

    let imagesToDelete: string[] = [];

    if (deleteImages)
      imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : [deleteImages];

    await this.userService.updateImages(
      files as Express.MulterS3.File[],
      user,
      imagesToDelete
    );

    res.status(HttpCodes.OK).json({ message: 'Images updated successfully' });
  };

  /**
   * Retrieves user's favorite animals.
   */
  getUserFavorites = async (req: Request, res: Response) => {
    const { limit = 10, page = 1, ...filters } = req.query;

    const { animals, ...pagination } = await this.userService.getFavorites(
      req.user,
      { limit: +limit, page: +page },
      filters
    );

    res.status(HttpCodes.OK).json({ ...pagination, animals });
  };

  /**
   * Retrieves user's animals.
   */
  getUserAnimals = async (req: Request, res: Response) => {
    const { limit = 10, page = 1, ...filters } = req.query;
    const { id } = req.user;

    const { animals, ...pagination } = await this.userService.getUserAnimals(
      id!,
      { limit: +limit, page: +page },
      filters
    );

    res.status(HttpCodes.OK).json({ ...pagination, animals });
  };

  /**
   * Retrieves user's notifications.
   */
  getUserNotifications = async (req: Request, res: Response) => {
    const { limit = 5, page = 1 } = req.query;
    const user = req.user;

    const notifications = await this.userService.getNotifications(user.id!, {
      limit: +limit,
      page: +page,
    });

    res.status(HttpCodes.OK).json(notifications);
  };

  readNotification = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    await this.userService.readNotification(user, id);

    res.status(HttpCodes.OK).json({ message: 'Notificación leida' });
  };

  deleteNotification = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    await this.userService.deleteNotification(user, id);
    res.status(HttpCodes.OK).json({ message: 'Notificación borrada' });
  };
}
