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
    const { name: cityName } = animalResponse.city!;
    const { avatar, username, isOnline } = animalResponse.shelter!.user!;

    const { id, images, name, age, gender, size, type, slug } = animalResponse;

    return {
      id,
      slug,
      name,
      age,
      gender,
      size,
      type,
      cityName,
      images,
      shelter: { avatar, username, isOnline },
    };
  }
}
