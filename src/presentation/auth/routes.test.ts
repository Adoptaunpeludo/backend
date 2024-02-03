import { BcryptAdapter } from '../../config';
import { prisma } from '../../data/postgres';
import { UserRoles } from '../../interfaces/user-response.interface';
import { testServer } from '../test-server';
import request from 'supertest';

const cleanDB = async () => {
  await prisma.$transaction([
    prisma.socialMedia.deleteMany(),
    prisma.contactInfo.deleteMany(),
    prisma.adopter.deleteMany(),
    prisma.shelter.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

interface User {
  username: string;
  email: string;
  password: string;
  role: UserRoles;
}

describe('Api auth routes testing', () => {
  const signupRoute = '/api/auth/register';
  const loginRoute = '/api/auth/login';
  const validateEmailRoute = '/api/auth/validate-email';
  const user: User = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'admin',
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

  describe('Register route tests api/auth/register', () => {
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

    test('Should return a bad request error with duplicate email', async () => {
      await prisma.user.create({ data: user });

      const { body } = await request(testServer.app)
        .post(signupRoute)
        .send(user)
        .expect(400);

      expect(body).toEqual({
        name: 'Bad Request',
        message: `Email ${user.email} already exists, try another one`,
      });
    });
  });

  describe('Login routes test api/auth/login', () => {
    const loginUser = {
      email: 'test@test.com',
      password: 'testtest',
    };

    test('Should return OK with correct credentials', async () => {
      const hash = BcryptAdapter.hash(user.password);

      await prisma.user.create({ data: { ...user, password: hash } });

      const { body } = await request(testServer.app)
        .post(loginRoute)
        .send(loginUser)
        .expect(200);

      expect(body).toEqual({
        message: 'User successfully logged in.',
      });
    });

    test('Should return an incorrect credentials error', async () => {
      await prisma.user.create({ data: user });

      const { body } = await request(testServer.app)
        .post(loginRoute)
        .send(loginUser)
        .expect(403);

      expect(body).toEqual({
        name: 'Unauthorized',
        message: 'Incorrect email or password',
      });
    });
  });

  describe('Validate email routes test api/auth/validate-email/:token', () => {
    test('Initial validate-email test', async () => {
      const params = 'test';
      const { body } = await request(testServer.app)
        .post(`${validateEmailRoute}/${params}`)
        .expect(200);

      expect(body).toEqual({
        token: params,
      });
    });
  });
});
