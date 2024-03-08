import { Request, Response } from 'express';
import { ChatService } from './service';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  requestChat = async (req: Request, res: Response) => {
    const { animalId } = req.params;
    const { userId, shelterId } = req.body;

    res.status(200).json({ animalId, userId, shelterId });
  };
}
