import { Router } from 'express';
import { ChatService } from './service';
import { ChatController } from './controller';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares';

export class ChatRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);
    const chatService = new ChatService();
    const chatController = new ChatController(chatService);

    router.use(authMiddleware.authenticateUser);

    router.get('/', chatController.userChats);
    router.get('/history/:chat', chatController.getChatHistory);
    router.get('/:slug', chatController.getChat);

    return router;
  }
}
