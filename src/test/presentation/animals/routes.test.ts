import { prisma } from '../../../data/postgres';
import { testServer } from '../../../presentation/test-server';
import { TestUser, cleanDB } from '../auth/routes.test';
import request from 'supertest';
import { CreateAnimalDto } from '../../../domain';
import { gender, statusPet } from '../../../domain/interfaces';

jest.mock('../../../presentation/shared/services');

describe('Api animals routes testing', () => {
  const loginRoute = '/api/auth/login';
  const registerRoute = '/api/auth/register';
  const createCatRoute = '/api/animals/cat';
  const createDogRoute = '/api/animals/dog';
  const verifyEmailRoute = '/api/auth/verify-email';
  const animalsRoute = '/api/animals';

  const user: TestUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'testtest',
    role: 'shelter',
  };

  const animal: CreateAnimalDto = {
    type: 'cat',
    name: 'nero',
    age: 14,
    description: 'Cold as Hell',
    breed: 'Unknown',
    size: 'medium',
    easyTrain: true,
    energyLevel: 'light',
    moltingAmount: 'light',
    gender: gender.M,
    city: 'Granada',
    status: statusPet.A,
  };

  const cat = {
    playLevel: 'excessive',
    kidsFriendly: true,
    toiletTrained: false,
    scratchPotential: 'excessive',
  };

  const dog = {
    departmentAdapted: false,
    droolingPotential: 'excessive',
    bark: 'excessive',
  };

  const { ...userRest } = user;

  beforeAll(async () => {
    prisma.$connect();
    await testServer.start();
    await cleanDB();
  });

  beforeEach(async () => {
    const { body: bodyResponse } = await request(testServer.app)
      .post(registerRoute)
      .send(user)
      .expect(201);

    await request(testServer.app)
      .post(`${verifyEmailRoute}/${bodyResponse.token}`)
      .expect(200);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await cleanDB();
  });

  afterAll(async () => {
    prisma.$disconnect();
    await testServer.stop();
  });

  describe('Animals post routes', () => {
    test('Should create a new cat', async () => {
      const response = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = response.headers['set-cookie'];
      const { body } = await request(testServer.app)
        .post(createCatRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ ...animal, ...cat })
        .expect(201);

      expect(body).toEqual({
        id: expect.any(String),
        gender: 'male',
        name: 'nero',
        type: 'cat',
        slug: 'test-nero',
        age: 14,
        description: 'Cold as Hell',
        breed: 'Unknown',
        size: 'medium',
        numFavs: 0,
        publishStatus: 'published',
        status: 'adopted',
        easyTrain: false,
        energyLevel: 'light',
        moltingAmount: 'light',
        images: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        adoptedBy: null,
        createdBy: expect.any(String),
        cityId: 4,
      });
    });
    test('Should create a new dog', async () => {
      const response = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = response.headers['set-cookie'];
      const { body } = await request(testServer.app)
        .post(createDogRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ ...animal, type: 'dog', ...dog })
        .expect(201);

      expect(body).toEqual({
        id: expect.any(String),
        gender: 'male',
        name: 'nero',
        type: 'dog',
        slug: 'test-nero',
        age: 14,
        description: 'Cold as Hell',
        breed: 'Unknown',
        size: 'medium',
        numFavs: 0,
        publishStatus: 'published',
        status: 'adopted',
        easyTrain: false,
        energyLevel: 'light',
        moltingAmount: 'light',
        images: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        adoptedBy: null,
        createdBy: expect.any(String),
        cityId: 4,
      });
    });
  });

  describe('Animals get routes', () => {
    test('Should return all created animals', async () => {
      const response = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = response.headers['set-cookie'];

      await request(testServer.app)
        .post(createCatRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ ...animal, ...cat })
        .expect(201);

      await request(testServer.app)
        .post(createDogRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ ...animal, type: 'dog', ...dog })
        .expect(201);

      const { body } = await request(testServer.app)
        .get(animalsRoute)
        .expect(200);

      console.log({ body });

      expect(body.animals[0].slug).not.toBe(body.animals[1].slug);

      expect(body).toEqual({
        currentPage: 1,
        maxPages: 1,
        awaitingHome: 0,
        fostered: 0,
        adopted: 2,
        limit: 10,
        total: 2,
        next: null,
        prev: null,
        animals: [
          {
            id: expect.any(String),
            slug: expect.any(String),
            name: 'nero',
            age: 14,
            gender: 'male',
            size: 'medium',
            description: 'Cold as Hell',
            publishStatus: 'published',
            status: 'adopted',
            userFavs: expect.any(Array),
            numFavs: 0,
            type: expect.any(String),
            city: 'Granada',
            images: expect.any(Array),
            shelter: expect.any(Object),
          },
          {
            id: expect.any(String),
            slug: expect.any(String),
            name: 'nero',
            age: 14,
            gender: 'male',
            size: 'medium',
            description: 'Cold as Hell',
            publishStatus: 'published',
            status: 'adopted',
            userFavs: expect.any(Array),
            numFavs: 0,
            type: expect.any(String),
            city: 'Granada',
            images: expect.any(Array),
            shelter: expect.any(Object),
          },
        ],
      });
    });

    test('Should return an animal given his id or slug', async () => {
      const response = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = response.headers['set-cookie'];

      await request(testServer.app)
        .post(createCatRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ ...animal, ...cat })
        .expect(201);

      const animals = await prisma.animal.findMany();

      const { body: byId } = await request(testServer.app)
        .get(`${animalsRoute}/${animals[0].id}`)
        .expect(200);

      const { body: bySlug } = await request(testServer.app)
        .get(`${animalsRoute}/${animals[0].slug}`)
        .expect(200);

      expect(byId).toEqual(bySlug);
    });
  });

  describe('Animals delete route', () => {
    test('Should delete a animal given his id or slug', async () => {
      const response = await request(testServer.app)
        .post(loginRoute)
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      const [accessToken, refreshToken] = response.headers['set-cookie'];

      await request(testServer.app)
        .post(createCatRoute)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .send({ ...animal, ...cat })
        .expect(201);

      const animals = await prisma.animal.findMany();

      const { body } = await request(testServer.app)
        .delete(`${animalsRoute}/${animals[0].id}`)
        .set('Cookie', accessToken)
        .set('Cookie', refreshToken)
        .expect(200);

      console.log({ body });
    });
  });

  describe('Animals put', () => {});
});
//
