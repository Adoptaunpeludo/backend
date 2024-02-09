import { UserResponse } from '../../../interfaces/user-response.interface';
import { UserEntity } from '../../../domain/entities/user.entity';

describe('user.entity.ts', () => {
  // Should return a user entity object with common user properties and contact info
  test('should return a user entity object with common user properties and contact info', () => {
    const userResponse: UserResponse = {
      id: '1',
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678A',
      emailValidated: true,
      verificationToken: 'token',
      passwordToken: 'token',
      role: 'shelter',
      createdAt: new Date(),
      updatedAt: new Date(),
      verifiedAt: null,
      avatar: 'avatar.jpg',
      isOnline: true,
      shelter: null,
      admin: null,
      contactInfo: {
        id: '1',
        phoneNumber: '1234567890',
        address: '123 Main St',
        cityId: 1,
        city: {
          id: 1,
          name: 'New York',
        },
      },
    };

    const expectedUserEntity = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678A',
      emailValidated: true,
      role: 'shelter',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      verifiedAt: null,
      avatar: 'avatar.jpg',
      isOnline: true,
      phoneNumber: '1234567890',
      address: '123 Main St',
      city: 'New York',
      description: undefined,
      cif: undefined,
      legalForms: undefined,
      veterinaryFacilities: undefined,
      facilities: undefined,
      ownVet: undefined,
      images: undefined,
      socialMedia: [],
    };

    const userEntity = UserEntity.fromObject(userResponse);

    console.log({ userEntity });

    expect(userEntity).toEqual(expectedUserEntity);
  });

  test('should return a user entity object with shelter properties if user role is "shelter"', () => {
    const userResponse: UserResponse = {
      id: '1',
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678A',
      emailValidated: true,
      verificationToken: 'token',
      passwordToken: 'token',
      role: 'shelter',
      createdAt: new Date(),
      updatedAt: new Date(),
      verifiedAt: null,
      avatar: 'avatar.jpg',
      isOnline: true,
      shelter: {
        id: '1',
        description: 'Shelter description',
        cif: '12345678B',
        legalForms: 'association',
        veterinaryFacilities: true,
        facilities: 'foster_homes',
        ownVet: true,
        images: ['image1.jpg', 'image2.jpg'],
        socialMedia: [
          { shelterId: '1', name: 'facebook', url: 'https://facebook.com' },
          { shelterId: '1', name: 'xtweet', url: 'https://twitter.com' },
        ],
      },
      admin: null,
      contactInfo: {
        id: '1',
        phoneNumber: '1234567890',
        address: '123 Main St',
        cityId: 1,
        city: {
          id: 1,
          name: 'New York',
        },
      },
    };

    const expectedUserEntity = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678A',
      emailValidated: true,
      role: 'shelter',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      verifiedAt: null,
      avatar: 'avatar.jpg',
      isOnline: true,
      phoneNumber: '1234567890',
      address: '123 Main St',
      city: 'New York',
      description: 'Shelter description',
      cif: '12345678B',
      legalForms: 'association',
      veterinaryFacilities: true,
      facilities: 'foster_homes',
      ownVet: true,
      images: ['image1.jpg', 'image2.jpg'],
      socialMedia: [
        { name: 'facebook', url: 'https://facebook.com' },
        { name: 'xtweet', url: 'https://twitter.com' },
      ],
    };

    const userEntity = UserEntity.fromObject(userResponse);

    expect(userEntity).toEqual(expectedUserEntity);
  });
  test('should return a user entity object with admin name if user role is "admin"', () => {
    const userResponse: UserResponse = {
      id: '1',
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678A',
      emailValidated: true,
      verificationToken: 'token',
      passwordToken: 'token',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      verifiedAt: null,
      avatar: 'avatar.jpg',
      isOnline: true,
      shelter: {
        id: '1',
        description: 'Shelter description',
        cif: '12345678B',
        legalForms: 'association',
        veterinaryFacilities: true,
        facilities: 'foster_homes',
        ownVet: true,
        images: ['image1.jpg', 'image2.jpg'],
        socialMedia: [
          { shelterId: '1', name: 'facebook', url: 'https://facebook.com' },
          { shelterId: '1', name: 'xtweet', url: 'https://twitter.com' },
        ],
      },
      admin: {
        id: '1',
        name: 'admin',
      },
      contactInfo: {
        id: '1',
        phoneNumber: '1234567890',
        address: '123 Main St',
        cityId: 1,
        city: {
          id: 1,
          name: 'New York',
        },
      },
    };

    const expectedUserEntity = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678A',
      emailValidated: true,
      role: 'admin',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      verifiedAt: null,
      avatar: 'avatar.jpg',
      isOnline: true,
      phoneNumber: '1234567890',
      address: '123 Main St',
      city: 'New York',
      name: 'admin',
    };

    const userEntity = UserEntity.fromObject(userResponse);

    expect(userEntity).toEqual(expectedUserEntity);
  });
});
