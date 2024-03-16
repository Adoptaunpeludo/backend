import { AnimalResponse } from '../interfaces/animal.interface';

export class AnimalEntity {
  static fromObjectDetail(animalResponse: AnimalResponse) {
    const { shelter, cat, dog, city, ...rest } = animalResponse;
    const { cityId, ...animalData } = rest;

    const {
      user: { avatar, username, isOnline },
      ...userInfo
    } = shelter!;
    const typeInfo = animalResponse.type === 'cat' ? { ...cat } : { ...dog };

    return {
      ...animalData,
      ...typeInfo,
      city: city!.name,
      user: {
        avatar,
        username,
        isOnline,
      },
    };
  }

  static fromArray(animalsResponse: AnimalResponse[]) {
    return animalsResponse.map((animal) => this.fromObject(animal));
  }

  static fromObject(animalResponse: AnimalResponse) {
    const { name: city } = animalResponse.city!;
    const { avatar, username, isOnline } = animalResponse.shelter!.user!;

    const {
      id,
      images,
      name,
      age,
      gender,
      size,
      type,
      slug,
      numFavs,
      publishStatus,
      status,
    } = animalResponse;

    return {
      id,
      slug,
      name,
      age,
      gender,
      size,
      type,
      city,
      publishStatus,
      status,
      images,
      numFavs,
      shelter: { avatar, username, isOnline },
    };
  }
}
