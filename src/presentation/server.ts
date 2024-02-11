import 'express-async-errors';
import express, { Request, Response, Router } from 'express';
import cookieParser from 'cookie-parser';

import { ErrorHandlerMiddleware, NotFoundMiddleware } from './middlewares';
import { envs } from '../config';
import { prisma } from '../data/postgres';

interface Options {
  port: number;
  routes: Router;
  publicPath?: string;
}

export class Server {
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, publicPath = 'public' } = options;

    this.port = port;
    this.publicPath = publicPath;
    this.routes = routes;
  }

  async start() {
    //* Middlewares
    this.app.use(express.json()); // raw
    this.app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
    this.app.use(cookieParser(envs.JWT_SEED));

    //* Public Folder
    this.app.use(express.static(this.publicPath));

    //* Routes
    this.app.use(this.routes);

    //* CI/CD Test
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendFile('index.html');
    });

    //* NotFound Middleware
    this.app.use(NotFoundMiddleware.init);

    //* Error Handler Middleware
    this.app.use(ErrorHandlerMiddleware.handle);

    this.serverListener = this.app.listen(this.port, async () => {
      try {
        await prisma.$connect();
        console.log('Connected to database');
        console.log(`Server running on port ${this.port}`);
      } catch (error) {
        console.log(error);
        console.log('There was an error connection to the database');
      }
    });
  }

  public stop() {
    return new Promise((resolve, reject) => {
      this.serverListener.close((error: Error | undefined) => {
        if (error) {
          console.log({ error });
          reject('There was an error closing the server');
        } else {
          console.log('Server closed');
          resolve(true);
        }
      });
    });
  }
}
