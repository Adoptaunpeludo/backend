import { Router } from 'express';
import { ChatService } from './service';
import { ChatController } from './controller';
import { JWTAdapter, envs } from '../../config';
import { AuthMiddleware } from '../middlewares';
import { QueueService } from '../shared/services';

export class ChatRoutes {
  static get routes() {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);
    const notificationService = new QueueService(
      envs.RABBITMQ_URL,
      'notification-request'
    );
    const chatService = new ChatService(notificationService);
    const chatController = new ChatController(chatService);

    router.use(authMiddleware.authenticateUser);

    router.get('/', chatController.userChats);
    router.get('/history/:chat', chatController.getChatHistory);
    router.get('/:slug', chatController.getChat);

    router.post('/', chatController.createChat);

    return router;
  }
}
