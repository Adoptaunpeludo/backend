import { prismaWithSlugExtension as prisma } from '../../data/postgres';
import {
  AnimalFilterDto,
  CreateCatDto,
  CreateDogDto,
  PaginationDto,
} from '../../domain/dtos';

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

  private mapFilters(animalFilterDto: AnimalFilterDto) {
    let filters: any = {};

    Object.entries(animalFilterDto).forEach(([key, value]) => {
      if (key === 'age') {
        if (value === 'puppy') filters.age = { gte: 0, lte: 2 };
        if (value === 'adult') filters.age = { gte: 2, lte: 10 };
        if (value === 'senior') filters.age = { gt: 10 };
      }
      filters[key] = value;
    });

    return filters;
  }

  public async getAll(
    paginationDto: PaginationDto,
    animalFilterDto: AnimalFilterDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const filters = this.mapFilters(animalFilterDto);

    const [total, animals] = await prisma.$transaction([
      prisma.animal.count({ where: filters }),
      prisma.animal.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: filters,
        include: {
          shelter: {
            include: { user: { select: { avatar: true, username: true } } },
          },
          city: true,
          cat: true,
          dog: true,
        },
      }),
    ]);

    const maxPages = Math.ceil(total / limit);

    return {
      currentPage: page,
      maxPages,
      limit,
      total,
      next:
        page + 1 <= maxPages
          ? `/api/animals?page=${page + 1}&limit=${limit}`
          : null,
      prev:
        page - 1 > 0 ? `/api/animals?page=${page - 1}&limit=${limit}` : null,
      animals,
    };
  }
  public async update() {
    return 'Update Animal';
  }
  public async delete() {
    return 'Delete Animal';
  }
}
