import { PrismaClient } from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions,
} from '@prisma/client/runtime/library';

interface UserMethods {
  hashPassword: (password: string) => string;
  validatePassword: (args: { password: string; hash: string }) => boolean;
}

interface ModelMethods {
  user: UserMethods;
}

interface PrismaTypeMap<
  Result extends Record<string, any>,
  Model extends Record<string, any>,
  Query extends Record<string, any>,
  Client extends Record<string, any>
> {
  result: Result;
  model: Model;
  query: Query;
  client: Client;
}

export interface Prisma extends PrismaTypeMap<{}, ModelMethods, {}, {}> {}

export interface PrismaWithPassword
  extends PrismaClient<PrismaClientOptions, never, DefaultArgs> {}
