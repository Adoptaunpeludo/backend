import { AnimalResponse } from '../interfaces/animal.interface';

export class AnimalEntity {
  static fromArray(animalsResponse: AnimalResponse[]) {
    return animalsResponse.map((animal) => this.fromObject(animal));
  }

  static fromObject(animalResponse: AnimalResponse) {
    const {
      images,
      name,
      age,
      gender,
      size,
      type,
      slug,
      city: { name: cityName },
      shelter: {
        user: { avatar, username },
      },
    } = animalResponse;

    return {
      slug,
      name,
      age,
      gender,
      size,
      type,
      cityName,
      images,
      shelter: { avatar, username },
    };
  }
}
