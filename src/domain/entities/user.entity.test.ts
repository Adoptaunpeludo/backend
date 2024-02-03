import { UserResponse } from '../../interfaces/user-response.interface';
import { UserEntity } from './user.entity';

describe('user.entity.ts', () => {
  const shelterRaw: UserResponse = {
    id: '433df3eb-e2de-4152-94b3-97b980ba7993',
    email: 'shelter1@example.com',
    password: '$2a$10$DtzTZQ71yv6WeHJugqLnoOD2p/otC7hFxka6H9.6zWj9Abr0SQQ2W',
    username: 'test',
    emailValidated: false,
    role: 'shelter',
    createdAt: '2024-02-03T00:22:58.966Z' as unknown as Date,
    updatedAt: '2024-02-03T00:22:58.966Z' as unknown as Date,
    avatar: 'avatar.png',
    admin: null,
    adopter: null,
    contactInfo: {
      id: '433df3eb-e2de-4152-94b3-97b980ba7993',
      phoneNumber: '123456789',
      address: '13 rue del percebe',
      cityId: 1,
      city: {
        id: 1,
        name: 'Almería',
      },
    },
    shelter: {
      id: '433df3eb-e2de-4152-94b3-97b980ba7993',
      name: 'Shelter2',
      description: '',
      socialMedia: [
        {
          id: 25,
          name: 'facebook',
          url: 'http://facebook.com/shelter',
          shelterId: '433df3eb-e2de-4152-94b3-97b980ba7993',
        },
        {
          id: 26,
          name: 'xtweet',
          url: 'http://twitter.com/shelter',
          shelterId: '433df3eb-e2de-4152-94b3-97b980ba7993',
        },
        {
          id: 27,
          name: 'instagram',
          url: 'http://instagram.com/shelter',
          shelterId: '433df3eb-e2de-4152-94b3-97b980ba7993',
        },
      ],
    },
  };

  const adminRaw: UserResponse = {
    id: 'e7080bba-a52e-42e8-805a-0d2952219e7e',
    email: 'admin@example.com',
    password: '$2a$10$8bpBFuudAV.xnTYderR0YeuF/2KwpqQD7AoFCQm2TT.I1gkI8.okq',
    username: 'test',
    emailValidated: false,
    role: 'admin',
    createdAt: '2024-02-03T00:22:58.966Z' as unknown as Date,
    updatedAt: '2024-02-03T00:22:58.966Z' as unknown as Date,
    avatar: 'avatar.png',
    admin: {
      id: 'e7080bba-a52e-42e8-805a-0d2952219e7e',
      name: 'AdminName',
    },
    adopter: null,
    contactInfo: {
      id: 'e7080bba-a52e-42e8-805a-0d2952219e7e',
      phoneNumber: '111222333',
      address: '13 rue del percebe',
      cityId: 1,
      city: {
        id: 1,
        name: 'Almería',
      },
    },
    shelter: null,
  };

  const adopterRaw: UserResponse = {
    id: '9e683ac5-b2db-4fc9-b24d-b0a9d2246a26',
    email: 'adopter@example.com',
    password: '$2a$10$WQYgHZimghMtZKIwe91jCOOOykVyeat1hFeNrXB/0A7kIlSeJtW02',
    username: 'test',
    emailValidated: false,
    role: 'adopter',
    createdAt: '2024-02-03T00:22:58.966Z' as unknown as Date,
    updatedAt: '2024-02-03T00:22:58.966Z' as unknown as Date,
    avatar: 'avatar.png',
    admin: null,
    adopter: {
      id: '9e683ac5-b2db-4fc9-b24d-b0a9d2246a26',
      firstName: 'AdopterFirstName',
      lastName: 'AdopterLastName',
    },
    contactInfo: {
      id: '9e683ac5-b2db-4fc9-b24d-b0a9d2246a26',
      phoneNumber: '555666777',
      address: '13 rue del percebe',
      cityId: 1,
      city: {
        id: 1,
        name: 'Almería',
      },
    },
    shelter: null,
  };

  test('should return an shelter user entity', () => {
    const shelter = UserEntity.fromObject(shelterRaw);

    expect(shelter).toEqual({
      id: shelterRaw.id,
      email: shelterRaw.email,
      username: shelterRaw.username,
      emailValidated: shelterRaw.emailValidated,
      role: shelterRaw.role,
      createdAt: shelterRaw.createdAt,
      updatedAt: shelterRaw.updatedAt,
      avatar: shelterRaw.avatar,
      phoneNumber: shelterRaw.contactInfo?.phoneNumber,
      address: shelterRaw.contactInfo?.address,
      city: shelterRaw.contactInfo?.city.name,
      name: shelterRaw.shelter?.name,
      description: shelterRaw.shelter?.description,
      socialMedia: [
        {
          name: shelterRaw.shelter?.socialMedia[0].name,
          url: shelterRaw.shelter?.socialMedia[0].url,
        },
        {
          name: shelterRaw.shelter?.socialMedia[1].name,
          url: shelterRaw.shelter?.socialMedia[1].url,
        },
        {
          name: shelterRaw.shelter?.socialMedia[2].name,
          url: shelterRaw.shelter?.socialMedia[2].url,
        },
      ],
    });
  });

  test('should return an admin user entity', () => {
    const admin = UserEntity.fromObject(adminRaw);

    expect(admin).toEqual({
      id: adminRaw.id,
      email: adminRaw.email,
      username: adminRaw.username,
      emailValidated: adminRaw.emailValidated,
      role: adminRaw.role,
      createdAt: adminRaw.createdAt,
      updatedAt: adminRaw.updatedAt,
      avatar: adminRaw.avatar,
      phoneNumber: adminRaw.contactInfo?.phoneNumber,
      address: adminRaw.contactInfo?.address,
      city: adminRaw.contactInfo?.city.name,
      name: adminRaw.admin?.name,
    });
  });

  test('should return an adopter user entity', () => {
    const adopter = UserEntity.fromObject(adopterRaw);

    expect(adopter).toEqual({
      id: adopterRaw.id,
      email: adopterRaw.email,
      username: adopterRaw.username,
      emailValidated: adopterRaw.emailValidated,
      role: adopterRaw.role,
      createdAt: adopterRaw.createdAt,
      updatedAt: adopterRaw.updatedAt,
      avatar: adopterRaw.avatar,
      phoneNumber: adopterRaw.contactInfo?.phoneNumber,
      address: adopterRaw.contactInfo?.address,
      city: adopterRaw.contactInfo?.city.name,
      firstName: adopterRaw.adopter?.firstName,
      lastName: adopterRaw.adopter?.lastName,
    });
  });
});
