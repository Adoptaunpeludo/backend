import { Request, Response } from 'express';
import { prisma } from '../../data/postgres';
import { PayloadUser } from '../../domain/interfaces';
import { ChatService } from './service';
import { HttpCodes } from '../../config';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  userChats = async (req: Request, res: Response) => {
    const chats = await this.chatService.userChats(req.user);

    res.status(HttpCodes.OK).json(chats);
  };

  getChat = async (req: Request, res: Response) => {
    const { slug } = req.params;

    const chat = await this.chatService.getChat(req.user, slug);

    res.status(HttpCodes.OK).json(chat);
  };

  getChatHistory = async (req: Request, res: Response) => {
    const { chat } = req.params;

    const history = await this.chatService.chatHistory(chat);

    res.status(HttpCodes.OK).json(history);
  };
}
