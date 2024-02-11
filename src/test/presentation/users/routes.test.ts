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
  const usersRoute = '/api/users';
  const deleteUserRoute = '/api/users';
  const changePasswordRoute = '/api/users/change-password';
  const registerRoute = '/api/auth/register';
  const verifyEmailRoute = '/api/auth/verify-email';

  const user: TestUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'shelter',
    dni: '111111111',
    firstName: 'test',
    lastName: 'test',
    phoneNumber: '11111111',
    address: '13 rue del percebe',
    cityId: 7,
  };

  const user2: TestUser = {
    username: 'test2',
    email: 'test2@test.com',
    password: 'testtest',
    role: 'adopter',
    dni: '22222222',
    firstName: 'test',
    lastName: 'test',
    phoneNumber: '2222222',
    address: '13 rue del percebe',
    cityId: 7,
  };

  const admin: TestUser = {
    username: 'test',
    email: 'test3@test.com',
    password: 'testtest',
    role: 'admin',
    dni: '3333333333',
    firstName: 'test',
    lastName: 'test',
    phoneNumber: '333333333',
    address: '13 rue del percebe',
    cityId: 7,
  };

  const { phoneNumber: pn1, address: add1, cityId: ci1, ...userRest } = user;
  const { phoneNumber: pn2, address: add2, cityId: ci2, ...user2Rest } = user2;
  const { phoneNumber: pn3, address: add3, cityId: ci3, ...adminRest } = admin;

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
        address: user.address,
        cif: '',
        city: expect.any(String),
        facilities: null,
        images: expect.any(Array),
        legalForms: null,
        description: expect.any(String),
        ownVet: null,
        phoneNumber: user.phoneNumber,
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
        avatar: 'avatar.png',
        isOnline: false,
        socialMedia: [],
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

  describe('All users route tests api/users', () => {
    test('Should return all registered users', async () => {
      await prisma.user.create({ data: userRest });
      await prisma.user.create({ data: user2Rest });
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
        .get(usersRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      expect(body).toEqual(
        expect.arrayContaining([
          {
            animals: [],
            avatar: 'avatar.png',
            createdAt: expect.any(String),
            dni: '111111111',
            email: 'test@test.com',
            emailValidated: false,
            firstName: 'test',
            id: expect.any(String),
            isOnline: false,
            lastName: 'test',
            role: 'shelter',
            socialMedia: [],
            updatedAt: expect.any(String),
            username: 'test',
            verifiedAt: null,
          },
          {
            animals: [],
            avatar: 'avatar.png',
            createdAt: expect.any(String),
            dni: '22222222',
            email: 'test2@test.com',
            emailValidated: false,
            firstName: 'test',
            id: expect.any(String),
            isOnline: false,
            lastName: 'test',
            role: 'adopter',
            updatedAt: expect.any(String),
            username: 'test2',
            verifiedAt: null,
          },
          {
            animals: [],
            avatar: 'avatar.png',
            createdAt: expect.any(String),
            dni: '3333333333',
            email: 'test3@test.com',
            emailValidated: true,
            firstName: 'test',
            id: expect.any(String),
            isOnline: false,
            lastName: 'test',
            role: 'admin',
            updatedAt: expect.any(String),
            username: 'test',
            verifiedAt: null,
          },
        ])
      );
    });
  });

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
        .delete(`${deleteUserRoute}/${user.email}`)
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
        .delete(`${deleteUserRoute}/${user2.email}`)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      expect(body).toEqual({ message: 'User deleted successfully' });
    });

    test('Should return an Unauthorized error any user, tries that is not admin, tries to delete an user diferent from him', async () => {
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
          email: user2.email,
          password: user2.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const { body } = await request(testServer.app)
        .delete(`${deleteUserRoute}/${admin.email}`)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(403);

      expect(body).toEqual({
        name: 'Unauthorized',
        message: 'Not authorized to access this route',
      });
    });
  });

  describe('Update users route test api/users', () => {
    test('Should update an existing user', async () => {
      const hash = BcryptAdapter.hash(user.password);

      await prisma.user.create({
        data: {
          email: user.email,
          password: BcryptAdapter.hash(user.password),
          username: user.username || '',
          role: user.role,
          emailValidated: true,
          firstName: user.firstName,
          lastName: user.lastName,
          dni: user.dni,
          contactInfo: {
            create: {
              phoneNumber: '',
              cityId: 6,
              address: '',
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
        .put(`${usersRoute}/${user.email}`)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({
          username: 'testuser',
          firstName: 'test',
          lastName: 'tester',
          address: '13 rue del Percebe',
        })
        .expect(200);

      expect(body.user.username).toBe('testuser');
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
        .post(changePasswordRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ oldPassword: user.password, newPassword })
        .expect(200);

      expect(body).toEqual({ message: 'Password updated' });
    });
  });
});
