import { AnimalResponse } from '../interfaces/animal.interface';

export class AnimalEntity {
  // static fromObjectDetail(animalResponse: )

  static fromArray(animalsResponse: AnimalResponse[]) {
    return animalsResponse.map((animal) => this.fromObject(animal));
  }

  static fromObject(animalResponse: AnimalResponse) {
    const { name: cityName } = animalResponse.city!;
    const { avatar, username } = animalResponse.shelter!.user!;

    const { images, name, age, gender, size, type, slug } = animalResponse;

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
