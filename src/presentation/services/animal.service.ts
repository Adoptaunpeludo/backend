import { prismaWithSlugExtension as prisma } from '../../data/postgres';
import { CreateCatDto, CreateDogDto } from '../../domain/dtos';

export class AnimalService {
  constructor() {}

  public async createCat(
    userId: string,
    username: string,
    createCatDto: CreateCatDto
  ) {
    const {
      playLevel,
      kidsFriendly,
      toiletTrained,
      scratchPotential,
      ...rest
    } = createCatDto;

    const slug = await prisma.animal.generateUniqueSlug({
      name: rest.name,
      shelter: username,
    });

    const animal = await prisma.animal.create({
      data: {
        ...rest,
        createdBy: userId,
        slug,
        cat: {
          create: { playLevel, kidsFriendly, toiletTrained, scratchPotential },
        },
      },
    });

    return animal;
  }

  public async createDog(
    userId: string,
    username: string,
    createDogDto: CreateDogDto
  ) {
    const {
      departmentAdapted,
      droolingPotential,
      bark,

      ...rest
    } = createDogDto;

    const slug = await prisma.animal.generateUniqueSlug({
      name: rest.name,
      shelter: username,
    });

    const animal = await prisma.animal.create({
      data: {
        ...rest,
        createdBy: userId,
        slug,
        dog: {
          create: { departmentAdapted, droolingPotential, bark },
        },
      },
    });

    return animal;
  }
  public async getSingle() {
    return 'Get single Animal';
  }
  public async getAll() {
    const animals = prisma.animal.findMany({
      include: {
        shelter: {
          include: { user: { select: { avatar: true, username: true } } },
        },
        city: true,
        cat: true,
        dog: true,
      },
    });

    return animals;
  }
  public async update() {
    return 'Update Animal';
  }
  public async delete() {
    return 'Delete Animal';
  }
}
