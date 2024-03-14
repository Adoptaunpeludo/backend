import 'express-async-errors';
import express, { Request, Response, Router } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';

import { ErrorHandlerMiddleware, NotFoundMiddleware } from './middlewares';
import { envs } from '../config';
import { prisma } from '../data/postgres';

interface Options {
  port: number;
  routes: Router;
  publicPath?: string;
}

/**
 * Server class to start and stop the Express server.
 */
export class Server {
  public readonly app = express();
  public serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  /**
   * Constructor to initialize the Server instance.
   * @param options - Server options object.
   */
  constructor(options: Options) {
    const { port, routes, publicPath = 'public' } = options;

    this.port = port;
    this.publicPath = publicPath;
    this.routes = routes;
  }

  /**
   * Method to start the server.
   */
  async start() {
    //* Middlewares
    this.app.use(express.json()); // raw
    this.app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
    this.app.use(cookieParser(envs.JWT_SEED));

    const corsOptions = {
      origin: 'http://localhost:5173',
      credentials: true,
    };

    this.app.use(
      cors({
        origin: ['http://localhost:5173', 'https://www.adoptaunpeludo.com'],
        credentials: true,
      })
    );

    //* Public Folder
    this.app.use(express.static(this.publicPath));

    //* Routes
    this.app.use(this.routes);

    //* CI/CD Test
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    //* NotFound Middleware
    this.app.use(NotFoundMiddleware.init);

    //* Error Handler Middleware
    this.app.use(ErrorHandlerMiddleware.handle);

    //* Start the server and connect to the database
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
