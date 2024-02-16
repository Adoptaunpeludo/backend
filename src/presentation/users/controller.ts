import { Request, Response } from 'express';
import { HttpCodes } from '../../config/http-status-codes.adapter';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserService } from '../services/user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getAllUsers = async (_req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();

    const userEntities = users.map((user: any) => UserEntity.fromObject(user));

    res.status(HttpCodes.OK).json(userEntities);
  };

  getCurrentUser = async (req: Request, res: Response) => {
    const { email } = req.user;

    const user = await this.userService.getCurrentUser(email);

    const userEntity = UserEntity.fromObject(user);

    res.status(HttpCodes.OK).json(userEntity);
  };

  getSingleUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await this.userService.getSingleUser(id);

    const userEntity = UserEntity.fromObject(user);

    res.status(HttpCodes.OK).json(userEntity);
  };

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

  updateUser = async (req: Request, res: Response) => {
    const updates = req.body;
    const { user } = req;

    const updatedUser = await this.userService.updateUser(updates, user);

    const userEntity = UserEntity.fromObject(updatedUser);

    res
      .status(HttpCodes.OK)
      .json({ message: 'User updated successfully', user: userEntity });
  };

  changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    await this.userService.changePassword(oldPassword, newPassword, id!);

    res.status(HttpCodes.OK).json({ message: 'Password updated' });
  };

  updateSocialMedia = async (req: Request, res: Response) => {
    const updates = req.body;
    const user = req.user;

    await this.userService.updateSocialMedia(updates, user);

    res
      .status(HttpCodes.OK)
      .json({ message: 'Social media updated successfully' });
  };

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
}
