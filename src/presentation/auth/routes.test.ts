import { prisma } from '../../data/postgres';
import { UserRoles } from '../../interfaces/user-response.interface';
import { testServer } from '../test-server';
import request from 'supertest';

interface User {
  username: string;
  email: string;
  password: string;
  role: UserRoles;
}

describe('Api auth routes testing', () => {
  const signupRoute = '/api/auth/register';
  const loginRoute = '/api/auth/login';
  const user: User = {
    username: 'test',
    email: 'test1@test.com',
    password: 'testtest',
    role: 'admin',
  };

  beforeAll(async () => {
    await testServer.start();
  });

  afterEach(async () => {
    await prisma.user.delete({ where: { email: user.email } });
  });

  afterAll(async () => {
    await testServer.stop();
  });

  describe('Signup route tests api/auth/register', () => {
    test('Should create a new user', async () => {
      const { body } = await request(testServer.app)
        .post(signupRoute)
        .send(user)
        .expect(201);

      expect(body).toEqual({
        id: expect.any(String),
        email: user.email,
        password: expect.any(String),
        username: user.username,
        emailValidated: false,
        role: user.role,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        avatar: 'avatar.png',
      });
    });
  });
});
