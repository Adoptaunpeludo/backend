import { Router } from 'express';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares';
import { ChatService } from './service';
import { ChatController } from './controller';

export class ChatRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);

    const chatService = new ChatService();
    const chatController = new ChatController(chatService);

    router.get('/:animalId');

    return router;
  }
}
