import { AnimalEntity } from '../../../domain/entities/animals.entity';
import { AnimalResponse } from '../../../domain/interfaces/animal.interface';
describe('animals.entity.ts', () => {
  test('should correctly map an AnimalResponse object to an AnimalEntity object using the fromObject method', () => {
    const animalResponse: AnimalResponse = {
      id: '1',
      gender: 'male',
      name: 'Max',
      type: 'dog',
      slug: 'max',
      age: 3,
      description: 'A friendly dog',
      breed: 'Labrador Retriever',
      size: 'medium',
      publishStatus: 'published',
      status: 'available',
      easyTrain: true,
      energyLevel: 'high',
      moltingAmount: 'moderate',
      images: ['image1.jpg', 'image2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date(),
      adoptedBy: null,
      createdBy: 'user1',
      cityId: 1,
      shelter: {
        cif: '',
        description: '',
        facilities: 'foster_homes',
        id: '1',
        images: [],
        legalForms: 'association',
        ownVet: false,
        veterinaryFacilities: false,
        user: {
          avatar: 'avatar.jpg',
          username: 'shelter1',
          isOnline: true,
        },
      },
      city: {
        id: 1,
        name: 'New York',
      },
      cat: null,
      dog: {
        bark: '',
        departmentAdapted: false,
        droolingPotential: '',
        id: '1',
      },
    };

    const expectedAnimalEntity = {
      id: '1',
      slug: 'max',
      name: 'Max',
      age: 3,
      gender: 'male',
      size: 'medium',
      type: 'dog',
      cityName: 'New York',
      images: ['image1.jpg', 'image2.jpg'],
      shelter: {
        avatar: 'avatar.jpg',
        username: 'shelter1',
        isOnline: true,
      },
    };

    const animalEntity = AnimalEntity.fromObject(animalResponse);

    expect(animalEntity).toEqual(expectedAnimalEntity);
  });

  test('should correctly map an array of AnimalResponse objects to an array of AnimalEntity objects using the fromArray method', () => {
    const animalsResponse: any = [
      {
        id: '1',
        gender: 'male',
        name: 'Max',
        type: 'dog',
        slug: 'max',
        age: 3,
        description: 'A friendly dog',
        breed: 'Labrador Retriever',
        size: 'large',
        publishStatus: 'published',
        status: 'available',
        easyTrain: true,
        energyLevel: 'high',
        moltingAmount: 'moderate',
        images: ['image1.jpg', 'image2.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
        adoptedBy: null,
        createdBy: 'user1',
        cityId: 1,
        shelter: {
          user: {
            avatar: 'avatar.jpg',
            username: 'shelter1',
            isOnline: true,
          },
        },
        city: {
          name: 'New York',
        },
        cat: null,
        dog: {
          breedGroup: 'Sporting',
          lifeSpan: '10-12 years',
        },
      },
      {
        id: '2',
        gender: 'female',
        name: 'Lucy',
        type: 'cat',
        slug: 'lucy',
        age: 2,
        description: 'A playful cat',
        breed: 'Siamese',
        size: 'small',
        publishStatus: 'published',
        status: 'available',
        easyTrain: false,
        energyLevel: 'medium',
        moltingAmount: 'low',
        images: ['image3.jpg', 'image4.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
        adoptedBy: null,
        createdBy: 'user2',
        cityId: 2,
        shelter: {
          user: {
            avatar: 'avatar2.jpg',
            username: 'shelter2',
            isOnline: false,
          },
        },
        city: {
          name: 'Los Angeles',
        },
        cat: {
          breedGroup: 'Short-haired',
          lifeSpan: '12-15 years',
        },
        dog: null,
      },
    ];

    const expectedAnimalEntities = [
      {
        id: '1',
        slug: 'max',
        name: 'Max',
        age: 3,
        gender: 'male',
        size: 'large',
        type: 'dog',
        cityName: 'New York',
        images: ['image1.jpg', 'image2.jpg'],
        shelter: {
          avatar: 'avatar.jpg',
          username: 'shelter1',
          isOnline: true,
        },
      },
      {
        id: '2',
        slug: 'lucy',
        name: 'Lucy',
        age: 2,
        gender: 'female',
        size: 'small',
        type: 'cat',
        cityName: 'Los Angeles',
        images: ['image3.jpg', 'image4.jpg'],
        shelter: {
          avatar: 'avatar2.jpg',
          username: 'shelter2',
          isOnline: false,
        },
      },
    ];

    const animalEntities = AnimalEntity.fromArray(animalsResponse);

    expect(animalEntities).toEqual(expectedAnimalEntities);
  });

  test('should correctly map an AnimalResponse object to an AnimalEntity object using the fromObjectDetail method', () => {
    const animalResponse: any = {
      id: '1',
      gender: 'male',
      name: 'Max',
      type: 'cat',
      slug: 'max',
      age: 3,
      description: 'A friendly dog',
      breed: 'Labrador Retriever',
      size: 'large',
      publishStatus: 'published',
      status: 'available',
      easyTrain: true,
      energyLevel: 'high',
      moltingAmount: 'moderate',
      images: ['image1.jpg', 'image2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date(),
      adoptedBy: null,
      createdBy: 'user1',
      cityId: 1,
      shelter: {
        user: {
          avatar: 'avatar.jpg',
          username: 'shelter1',
          isOnline: true,
        },
      },
      city: {
        name: 'New York',
      },
      cat: {
        playLevel: 'low',
        kidsFriendly: false,
        toiletTrained: false,
        scratchPotential: 'low',
      },
      dog: null,
    };

    const expectedAnimalEntity = {
      id: '1',
      gender: 'male',
      name: 'Max',
      type: 'cat',
      slug: 'max',
      age: 3,
      description: 'A friendly dog',
      breed: 'Labrador Retriever',
      size: 'large',
      publishStatus: 'published',
      status: 'available',
      easyTrain: true,
      energyLevel: 'high',
      moltingAmount: 'moderate',
      images: ['image1.jpg', 'image2.jpg'],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      adoptedBy: null,
      createdBy: 'user1',
      city: 'New York',
      playLevel: 'low',
      kidsFriendly: false,
      toiletTrained: false,
      scratchPotential: 'low',
      user: {
        avatar: 'avatar.jpg',
        username: 'shelter1',
        isOnline: true,
      },
    };

    const animalEntity = AnimalEntity.fromObjectDetail(animalResponse);

    expect(animalEntity).toEqual(expectedAnimalEntity);
  });
});
