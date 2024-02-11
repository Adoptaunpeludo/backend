import { UUID } from '../../config/uuid.adapter';
import { prismaWithSlugExtension as prisma } from '../../data/postgres';
import { NotFoundError } from '../../domain';
import {
  AnimalFilterDto,
  CreateCatDto,
  CreateDogDto,
  PaginationDto,
} from '../../domain/dtos';
import { AnimalResponse } from '../../domain/interfaces';
import { IsUUID } from 'class-validator';
import { PayloadUser } from '../../domain/interfaces/payload-user.interface';
import { CheckPermissions } from '../../utils';
import { UpdateAnimalDto } from '../../domain/dtos/animals/update-animal.dto';

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

  private async getAnimalFromTerm(term: string) {
    let animal: AnimalResponse | null = null;

    const isUUID = UUID.validate(term);

    if (isUUID)
      animal = await prisma.animal.findUnique({
        where: { id: term },
        include: {
          shelter: { include: { user: true } },
          cat: true,
          dog: true,
          city: true,
        },
      });

    if (!isUUID) {
      animal = await prisma.animal.findUnique({
        where: { slug: term.toLowerCase() },
        include: {
          shelter: { include: { user: true } },
          cat: true,
          dog: true,
          city: true,
        },
      });
    }
    if (!animal) throw new NotFoundError('Animal not found');

    return animal;
  }
  public async getSingle(term: string) {
    const animal = this.getAnimalFromTerm(term);

    if (!animal) throw new NotFoundError('Animal not found');

    return animal;
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
            include: {
              user: {
                select: { avatar: true, username: true, isOnline: true },
              },
            },
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

  private buildQuery(updateAnimalDto: UpdateAnimalDto) {
    const updatedAt = new Date();

    let query: any;

    const {
      departmentAdapted,
      droolingPotential,
      bark,
      playLevel,
      kidsFriendly,
      toiletTrained,
      scratchPotential,
      type,
      ...common
    } = updateAnimalDto;

    query = {
      ...common,
      updatedAt,
      cat:
        type === 'cat'
          ? {
              playLevel,
              kidsFriendly,
              toiletTrained,
              scratchPotential,
            }
          : undefined,
      dog:
        type === 'dog'
          ? {
              droolingPotential,
              departmentAdapted,
              bark,
            }
          : undefined,
    };

    return query;
  }

  public async update(
    updateAnimalDto: UpdateAnimalDto,
    user: PayloadUser,
    term: string
  ) {
    const animal = await this.getAnimalFromTerm(term);

    CheckPermissions.check(user, animal.createdBy);

    const updateQuery = this.buildQuery(updateAnimalDto);

    console.log({ updateQuery });

    const updatedAnimal = await prisma.animal.update({
      where: { id: animal.id },
      data: updateQuery,
    });

    return 'Update Animal';
  }
  public async delete(user: PayloadUser, term: string) {
    const animal = await this.getAnimalFromTerm(term);

    CheckPermissions.check(user, animal.createdBy);

    await prisma.animal.delete({ where: { id: animal.id } });
  }
}
