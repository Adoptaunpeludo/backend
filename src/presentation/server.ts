import 'express-async-errors';
import express, { Router } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import helmet from 'helmet';

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
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }
    this.app.use(helmet());
    this.app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ['self'],
          imgSrc: [
            'self',
            'https://aup-s3images.s3.eu-west-3.amazonaws.com',
            'data:',
          ],
        },
      })
    );

    const swaggerDocument = YAML.load('./swagger.yml');

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

    // CI/CD Test
    // this.app.get('/', (_req: Request, res: Response) => {
    //   res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    // });

    //* Documentation
    this.app.use(
      '/api/docs',
      cors({ origin: '*' }),
      swaggerUI.serve,
      swaggerUI.setup(swaggerDocument)
    );

    //* NotFound Middleware
    this.app.use(NotFoundMiddleware.init);

    //* Error Handler Middleware
    const errorHandlerMiddleware = new ErrorHandlerMiddleware();
    this.app.use(errorHandlerMiddleware.handle);

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

  /**
   * Stops the server.
   * @returns A promise that resolves when the server is stopped successfully.
   */
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
