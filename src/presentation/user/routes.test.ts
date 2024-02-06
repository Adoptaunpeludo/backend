import request from 'supertest';
import { BcryptAdapter } from '../../config';
import { prisma } from '../../data/postgres';
import { TestUser, cleanDB } from '../auth/routes.test';
import { testServer } from '../test-server';

describe('Api user routes testing', () => {
  const loginRoute = '/api/auth/login';
  const currentUserRoute = '/api/users/me';
  const usersRoute = '/api/users';
  const deleteUserRoute = '/api/users';

  const user: TestUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'adopter',
  };

  const user2: TestUser = {
    username: 'test2',
    email: 'test2@test.com',
    password: 'testtest',
    role: 'shelter',
  };

  const admin: TestUser = {
    username: 'admin',
    email: 'admin@test.com',
    password: 'adminadmin',
    role: 'admin',
  };

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
      const hash = BcryptAdapter.hash(user.password);

      const newUser = await prisma.user.create({
        data: { ...user, emailValidated: true, password: hash },
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
        email: user.email,
        username: user.username,
        emailValidated: expect.any(Boolean),
        role: user.role,
        verified: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        avatar: expect.any(String),
        phoneNumber: expect.any(String),
        address: expect.any(String),
        city: null,
      });
    });

    test('Should return a not found error if the user is not found', async () => {
      const hash = BcryptAdapter.hash(user.password);

      await prisma.user.create({
        data: { ...user, emailValidated: true, password: hash },
      });

      const loginResponse = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        });

      const [accessToken, refreshToken] = loginResponse.headers['set-cookie'];

      const prismaUserMock = jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(null);

      const { body } = await request(testServer.app)
        .get(currentUserRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(404);

      prismaUserMock.mockRestore();

      expect(body).toEqual({
        name: 'Not Found',
        message: 'User not found',
      });
    });
  });

  describe('All users route tests api/users', () => {
    test('Should return all registered users', async () => {
      await prisma.user.create({ data: user });
      await prisma.user.create({ data: user2 });
      await prisma.user.create({
        data: {
          ...admin,
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
            id: expect.any(String),
            email: user.email,
            username: user.username,
            emailValidated: false,
            role: user.role,
            verified: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            avatar: 'avatar.png',
            phoneNumber: '',
            address: '',
            city: null,
          },
          {
            id: expect.any(String),
            email: user2.email,
            username: user2.username,
            emailValidated: false,
            role: user2.role,
            verified: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            avatar: 'avatar.png',
            phoneNumber: '',
            address: '',
            city: null,
            socialMedia: [],
          },
          {
            id: expect.any(String),
            email: admin.email,
            username: admin.username,
            emailValidated: true,
            role: admin.role,
            verified: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            avatar: 'avatar.png',
            phoneNumber: '',
            address: '',
            city: null,
          },
        ])
      );
    });
  });

  describe('Delete users route test api/users', () => {
    test('Should delete an user if current user is the owner', async () => {
      await prisma.user.create({
        data: {
          ...user,
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
          ...user2,
          emailValidated: true,
          password: BcryptAdapter.hash(user2.password),
        },
      });
      await prisma.user.create({
        data: {
          ...admin,
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
          ...user2,
          emailValidated: true,
          password: BcryptAdapter.hash(user2.password),
        },
      });
      await prisma.user.create({
        data: {
          ...admin,
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

          contactInfo: {
            create: {
              phoneNumber: '',
              cityId: null,
              address: '',
            },
          },
          adopter: {
            create: {
              firstName: '',
              lastName: '',
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

      console.log({ body });

      expect(body.user.username).toBe('testuser');
    });
  });
});
