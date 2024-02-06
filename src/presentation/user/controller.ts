import { Request, Response } from 'express';
import { HttpCodes } from '../../config/http-status-codes.adapter';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserService } from '../services/user.service';
import * as fs from 'fs';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getAllUsers = async (req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();

    const userEntities = users.map((user) => UserEntity.fromObject(user));

    res.status(HttpCodes.OK).json(userEntities);
  };

  getUser = async (req: Request, res: Response) => {
    const { email, role } = req.body.user;

    const user = await this.userService.getCurrentUser(email, role);

    const userEntity = UserEntity.fromObject(user);

    res.status(HttpCodes.OK).json(userEntity);
  };

  deleteUser = async (req: Request, res: Response) => {
    const { email } = req.params;

    await this.userService.deleteUser(req.body.user, email);

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
    const { email } = req.params;
    const { user, ...updates } = req.body;

    const updatedUser = await this.userService.updateUser(updates, user, email);

    res
      .status(HttpCodes.OK)
      .json({ message: 'User updated successfully', user: updatedUser });
  };

  changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.body.user;

    await this.userService.changePassword(oldPassword, newPassword, id);

    res.status(HttpCodes.OK).json({ message: 'Password updated' });
  };
}
