import { prisma } from '../../data/postgres';
import { TestUser, cleanDB } from '../auth/routes.test';
import { testServer } from '../test-server';

describe('Api user routes testing', () => {
  const currentUserRoute = '/api/users/me';
  const usersRoute = '/api/users';
  const deleteUserRoute = '/api/users/delete';

  const user: TestUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'adopter',
  };

  beforeAll(async () => {
    prisma.$connect();
    await testServer.start();
  });

  afterEach(async () => {
    await cleanDB();
  });

  afterAll(async () => {
    prisma.$disconnect();
    await testServer.stop();
  });

  describe('Current user route tests api/users/me', () => {});
});
