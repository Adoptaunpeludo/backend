import request from 'supertest';
import { BcryptAdapter } from '../../config';
import { prisma } from '../../data/postgres';
import { TestUser, cleanDB } from '../auth/routes.test';
import { testServer } from '../test-server';

describe('Api user routes testing', () => {
  const loginRoute = '/api/auth/login';
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

  describe('Current user route tests api/users/me', () => {
    test('Should return current logged user info', async () => {
      const hash = BcryptAdapter.hash(user.password);

      await prisma.user.create({
        data: { ...user, emailValidated: true, password: hash },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: 'test@test.com',
          password: 'testtest',
        });

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const { body } = await request(testServer.app)
        .get(currentUserRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      console.log({ body });
    });
  });
});
