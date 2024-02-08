import { citiesData } from './../../../data/seed/data';
import request from 'supertest';

import { BcryptAdapter } from '../../../config';
import { prisma } from '../../../data/postgres';
import { UserRoles } from '../../../interfaces';
import { testServer } from '../../../presentation/test-server';

export const cleanDB = async () => {
  await prisma.$transaction([
    prisma.socialMedia.deleteMany(),
    prisma.contactInfo.deleteMany(),
    prisma.shelter.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.token.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

export interface TestUser {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  dni: string;
  role: UserRoles;
  phoneNumber: string;
  address: string;
  cityId: number;
}

describe('Api auth routes testing', () => {
  const signupRoute = '/api/auth/register';
  const loginRoute = '/api/auth/login';
  const validateEmailRoute = '/api/auth/verify-email';
  const logoutRoute = '/api/auth/logout';
  const forgotPasswordRoute = '/api/auth/forgot-password';
  const resetPasswordRoute = '/api/auth/reset-password';

  const user: TestUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'shelter',
    dni: '22222222',
    firstName: 'test',
    lastName: 'test',
    phoneNumber: '2222222',
    address: '13 rue del percebe',
    cityId: 7,
  };

  const { phoneNumber, address, cityId, ...rest } = user;

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
        message: 'Success!, Please check your email to verify your account',
        token: expect.any(String),
      });
    });

    test('Should return a bad request error with duplicate email', async () => {
      await request(testServer.app).post(signupRoute).send(user).expect(201);

      const { body } = await request(testServer.app)
        .post(signupRoute)
        .send(user)
        .expect(400);

      expect(body).toEqual({
        name: 'Bad Request',
        message: `Email ${user.email} already exists, try another one`,
      });
    });

    test('Should return Invalid role error', async () => {
      const admin = { ...user, role: 'admin' };

      const { body } = await request(testServer.app)
        .post(signupRoute)
        .send(admin)
        .expect(400);

      expect(body).toEqual({
        name: 'Bad Request',
        message: 'Invalid role admin, must be "adopter" or "shelter"',
      });
    });

    test('Should return an error if malformed or not present email or password', async () => {
      const { body } = await request(testServer.app)
        .post(signupRoute)
        .send({})
        .expect(400);

      expect(body).toEqual({
        name: 'Bad Request',
        message: expect.any(String),
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

      // const mockLogin = jest.spyOn(AuthController.prototype, "login").mockImplementation(()=>{});

      await prisma.user.create({
        data: { ...rest, emailValidated: true, password: hash },
      });

      const { body } = await request(testServer.app)
        .post(loginRoute)
        .send(loginUser)
        .expect(200);

      expect(body).toEqual({
        message: 'User successfully logged in.',
      });
    });

    test('Should return an incorrect credentials error', async () => {
      await prisma.user.create({ data: rest });

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

  describe('Validate logout route test api/auth/logout', () => {
    test('logout route', async () => {
      const hash = BcryptAdapter.hash(user.password);

      await prisma.user.create({
        data: { ...rest, emailValidated: true, password: hash },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: 'test@test.com',
          password: 'testtest',
        });

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const response = await request(testServer.app)
        .delete(logoutRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      expect(response.headers['set-cookie'].at(-2)?.split(';').at(0)).toEqual(
        'refreshToken=logout'
      );
      expect(response.headers['set-cookie'].at(-1)?.split(';').at(0)).toEqual(
        'accessToken=logout'
      );
    });
  });

  describe('Validate email routes test api/auth/validate-email/:token', () => {
    test('Should validate email', async () => {
      await request(testServer.app).post(signupRoute).send(user).expect(201);

      const me = await prisma.user.findMany();

      const { body } = await request(testServer.app)
        .post(`${validateEmailRoute}/${me[0].verificationToken}`)
        .expect(200);

      expect(body).toEqual({
        message: 'Email validated',
        token: expect.any(String),
      });
    });
  });

  describe('Validate forgot-password routes test api/auth/forgot-password', () => {
    test('Should sen an reset password email', async () => {
      await request(testServer.app).post(signupRoute).send(user).expect(201);

      const me = await prisma.user.findMany();

      const { body } = await request(testServer.app)
        .post(forgotPasswordRoute)
        .send({ email: me[0].email })
        .expect(200);

      //* TODO: check mail service beeing called

      expect(body).toEqual({
        message: 'Reset password email sent successfully',
        token: expect.any(String),
      });
    });
  });

  describe('Validate reset-password routes test api/auth/reset-password', () => {
    test('Initial validate-email test', async () => {
      await request(testServer.app).post(signupRoute).send(user).expect(201);

      let me = await prisma.user.findMany();

      await request(testServer.app)
        .post(forgotPasswordRoute)
        .send({ email: me[0].email })
        .expect(200);

      me = await prisma.user.findMany();

      const { body } = await request(testServer.app)
        .post(`${resetPasswordRoute}/${me[0].passwordToken}`)
        .send({ password: 'testtest' })
        .expect(200);

      expect(body).toEqual({
        message: 'Password reset',
      });
    });
  });
});
