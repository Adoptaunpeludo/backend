import { AuthMiddleware } from './middlewares/auth.middleware';
import { Response, Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { UserRoutes } from './user/routes';
import { JWTAdapter, envs } from '../config';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    const jwt = new JWTAdapter(envs.JWT_SEED);
    const authMiddleware = new AuthMiddleware(jwt);

    router.use('/api/auth', AuthRoutes.routes);

    router.use(
      '/api/users',
      authMiddleware.authenticateUser,
      UserRoutes.routes
    );

    return router;
  }
}
