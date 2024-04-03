import request from 'supertest';
import { BcryptAdapter } from '../../../config';
import { prisma } from '../../../data/postgres';
import { TestUser, cleanDB } from '../auth/routes.test';
import { testServer } from '../../../presentation/test-server';
import {
  facilities,
  legalForms,
} from '../../../domain/interfaces/user-response.interface';

describe('Api user routes testing', () => {
  const loginRoute = '/api/auth/login';
  const currentUserRoute = '/api/users/me';
  const usersRoute = '/api/users/me';
  const deleteUserRoute = '/api/users/me';
  const changePasswordRoute = '/api/users/me/change-password';
  const registerRoute = '/api/auth/register';
  const verifyEmailRoute = '/api/auth/verify-email';

  const user: TestUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'shelter',
  };

  const user2: TestUser = {
    username: 'test2',
    email: 'test2@test.com',
    password: 'testtest',
    role: 'adopter',
  };

  const admin: TestUser = {
    username: 'admin',
    email: 'test3@test.com',
    password: 'testtest',
    role: 'admin',
  };

  const { ...userRest } = user;
  const { ...user2Rest } = user2;
  const { ...adminRest } = admin;

  beforeAll(async () => {
    prisma.$connect();
    await testServer.start();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await cleanDB();
  });

  afterAll(async () => {
    prisma.$disconnect();
    await testServer.stop();
  });

  describe('Current user route tests api/users/me', () => {
    test('Should return current logged user info', async () => {
      await request(testServer.app).post(registerRoute).send(user).expect(201);

      const newUser = await prisma.user.update({
        where: { email: userRest.email },
        data: { emailValidated: true },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        });

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const { body } = await request(testServer.app)
        .get(currentUserRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      expect(body).toEqual({
        id: newUser.id,
        email: newUser.email,
        cif: '',
        // city: expect.any(String),
        facilities: expect.any(Array),
        images: expect.any(Array),
        legalForms: null,
        description: expect.any(String),
        ownVet: null,
        // phoneNumber: expect.any(String),
        veterinaryFacilities: null,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        dni: newUser.dni,
        emailValidated: true,
        role: 'shelter',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        verifiedAt: null,
        avatar: expect.any(Array),
        isOnline: false,
        socialMedia: expect.any(Array),
        wsToken: expect.any(String),
      });
    });

    // test('Should return a not found error if the user is not found', async () => {
    //   const hash = BcryptAdapter.hash(user.password);

    //   await prisma.user.create({
    //     data: { ...userRest, emailValidated: true, password: hash },
    //   });

    //   const loginResponse = await request(testServer.app)
    //     .post(loginRoute)
    //     .send({
    //       email: user.email,
    //       password: user.password,
    //     });

    //   const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

    //   const prismaUserMock = jest
    //     .spyOn(prisma.user, 'findUnique')
    //     .mockResolvedValue(null);

    //   console.log(prisma.user.findUnique);

    //   const { body } = await request(testServer.app)
    //     .get(currentUserRoute)
    //     .set('Cookie', accessToken)
    //     .set('Cookie', refreshToken)
    //     .expect(404);

    //   prismaUserMock.mockRestore();

    //   expect(body).toEqual({
    //     name: 'Not Found',
    //     message: 'User not found',
    //   });
    // });
  });

  // describe('All users route tests api/users', () => {
  //   test('Should return all registered users', async () => {
  //     await prisma.user.create({ data: userRest });
  //     await prisma.user.create({ data: user2Rest });
  //     await prisma.user.create({
  //       data: {
  //         ...adminRest,
  //         role: 'admin',
  //         emailValidated: true,
  //         password: BcryptAdapter.hash(admin.password),
  //       },
  //     });

  //     const loginResponse = await request(testServer.app)
  //       .post(loginRoute)
  //       .send({
  //         email: admin.email,
  //         password: admin.password,
  //       })
  //       .expect(200);

  //     const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

  //     const { body } = await request(testServer.app)
  //       .get(usersRoute)
  //       .set('Cookie', accessToken)
  //       .set('Cookie', refreshToken)
  //       .expect(200);

  //     expect(body).toEqual(
  //       expect.arrayContaining([
  //         {
  //           animals: [],
  //           avatar: [],
  //           createdAt: expect.any(String),
  //           dni: '111111111',
  //           email: 'test@test.com',
  //           emailValidated: false,
  //           firstName: 'test',
  //           id: expect.any(String),
  //           isOnline: false,
  //           lastName: 'test',
  //           role: 'shelter',
  //           socialMedia: [],
  //           updatedAt: expect.any(String),
  //           username: 'test',
  //           verifiedAt: null,
  //           wsToken: expect.any(String),
  //         },
  //         {
  //           animals: [],
  //           avatar: [],
  //           createdAt: expect.any(String),
  //           dni: '22222222',
  //           email: 'test2@test.com',
  //           emailValidated: false,
  //           firstName: 'test',
  //           id: expect.any(String),
  //           isOnline: false,
  //           lastName: 'test',
  //           role: 'adopter',
  //           updatedAt: expect.any(String),
  //           username: 'test2',
  //           verifiedAt: null,
  //           wsToken: expect.any(String),
  //         },
  //         {
  //           animals: [],
  //           avatar: [],
  //           createdAt: expect.any(String),
  //           dni: '3333333333',
  //           email: 'test3@test.com',
  //           emailValidated: true,
  //           firstName: 'test',
  //           id: expect.any(String),
  //           isOnline: false,
  //           lastName: 'test',
  //           role: 'admin',
  //           updatedAt: expect.any(String),
  //           username: 'admin',
  //           verifiedAt: null,
  //           wsToken: expect.any(String),
  //         },
  //       ])
  //     );
  //   });
  // });

  describe('Delete users route test api/users', () => {
    test('Should delete an user if current user is the owner', async () => {
      await prisma.user.create({
        data: {
          ...userRest,
          emailValidated: true,
          password: BcryptAdapter.hash(user.password),
        },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const { body } = await request(testServer.app)
        .delete(deleteUserRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      expect(body).toEqual({ message: 'User deleted successfully' });
    });

    test('Should delete any user if user role is admin', async () => {
      await prisma.user.create({
        data: {
          ...user2Rest,
          emailValidated: true,
          password: BcryptAdapter.hash(user2.password),
        },
      });
      await prisma.user.create({
        data: {
          ...adminRest,
          role: 'admin',
          emailValidated: true,
          password: BcryptAdapter.hash(admin.password),
        },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: admin.email,
          password: admin.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const { body } = await request(testServer.app)
        .delete(deleteUserRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      expect(body).toEqual({ message: 'User deleted successfully' });
    });
  });

  describe('Update users route test api/users', () => {
    test('Should update an existing user', async () => {
      await prisma.user.create({
        data: {
          email: user.email,
          password: BcryptAdapter.hash(user.password),
          username: user.username || '',
          role: user.role,
          emailValidated: true,
          contactInfo: {
            create: {
              phoneNumber: '',
              cityId: 6,
            },
          },
        },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        });

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const { body } = await request(testServer.app)
        .put(usersRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({
          firstName: 'test',
          lastName: 'tester',
        })
        .expect(200);

      console.log({ body });

      expect(body.username).toBe('test');
    });
  });

  describe('Change password route test api/change-password', () => {
    test('should change user password', async () => {
      const {
        body: { token },
      } = await request(testServer.app)
        .post(registerRoute)
        .send(user)
        .expect(201);

      await request(testServer.app)
        .post(`${verifyEmailRoute}/${token}`)
        .expect(200);

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({ email: user.email, password: user.password })
        .expect(200);

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const newPassword = 'testuser';

      const { body } = await request(testServer.app)
        .put(changePasswordRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ oldPassword: user.password, newPassword })
        .expect(200);

      expect(body).toEqual({ message: 'Password updated' });
    });
  });
});
