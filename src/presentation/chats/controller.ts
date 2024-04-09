import { Request, Response } from 'express';
import { prisma } from '../../data/postgres';
import { PayloadUser } from '../../domain/interfaces';
import { ChatService } from './service';
import { HttpCodes } from '../../config';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Creates a new chat.
   * @param req - The request object.
   * @param res - The response object.
   */
  createChat = async (req: Request, res: Response) => {
    const chat = await this.chatService.createChat(req.user, req.body);

    res.status(HttpCodes.OK).json(chat);
  };

  /**
   * Retrieves all chats of a user.
   * @param req - The request object.
   * @param res - The response object.
   */
  userChats = async (req: Request, res: Response) => {
    const chats = await this.chatService.userChats(req.user);

    res.status(HttpCodes.OK).json(chats);
  };

  /**
   * Retrieves a chat by its slug.
   * @param req - The request object.
   * @param res - The response object.
   */
  getChat = async (req: Request, res: Response) => {
    const { slug } = req.params;

    const chat = await this.chatService.getChat(req.user, slug);

    res.status(HttpCodes.OK).json(chat);
  };

  /**
   * Retrieves the chat history by chat slug.
   * @param req - The request object.
   * @param res - The response object.
   */
  getChatHistory = async (req: Request, res: Response) => {
    const { chat } = req.params;

    const history = await this.chatService.chatHistory(chat);

    res.status(HttpCodes.OK).json(history);
  };
}
