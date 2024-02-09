import { AuthMiddleware } from './middlewares/auth.middleware';
import { Response, Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { UserRoutes } from './users/routes';
import { AnimalRoutes } from './animals/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);

    router.use('/api/users', UserRoutes.routes);

    router.use('/api/animals/', AnimalRoutes.routes);

    return router;
  }
}
