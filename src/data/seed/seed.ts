import { createInterface } from 'readline';
import { prismaWithPasswordExtension as prisma } from '../postgres';
import { prismaWithSlugExtension as prismaSlug } from '../postgres';
import { citiesData, users, animals } from './data';
import {
  AllowedMedia,
  UserRoles,
} from '../../domain/interfaces/user-response.interface';

const getRandomShelterId = (shelter1: any, shelter2: any) => {
  const shelters = [shelter1, shelter2];
  const randomIndex = Math.floor(Math.random() * shelters.length);
  return shelters[randomIndex];
};

const confirmationQuestion = (text: string) => {
  return new Promise((resolve) => {
    const ifc = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    ifc.question(text, (res) => {
      ifc.close();
      resolve(res.toLowerCase() === 'yes' || res.toLowerCase() === 'y');
    });
  });
};

(async () => {
  await prisma.$connect();

  const confirmation = await confirmationQuestion(
    'Are you sure do you want to wipe and repopulate the database? (yes/no): '
  );

  if (!confirmation) {
    await prisma.$disconnect();
    process.exit();
  }

  await prisma.socialMedia.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  const cities = await prisma.city.findMany();
  if (cities.length === 0) {
    const citiesNames = citiesData.map((city) => ({
      name: city.label,
    }));

    await prisma.city.createMany({ data: citiesNames });
  }

  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: prisma.user.hashPassword(userData.password),
        username: userData.username,
        emailValidated: userData.emailValidated,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        role: userData.role,
        dni: userData.dni,
        firstName: userData.firstName,
        lastName: userData.lastName,
        verifiedAt: userData.verifiedAt,
        avatar: userData.avatar,
        contactInfo: {
          create: {
            phoneNumber: userData.contactInfo.phoneNumber,
            city: {
              connect: { id: userData.contactInfo.cityId },
            },
          },
        },

        shelter: userData.shelter
          ? {
              create: {
                cif: userData.shelter.cif,
                description: userData.shelter.description,
                facilities: userData.shelter.facilities,
                legalForms: userData.shelter.legalForms,
                ownVet: userData.shelter.ownVet,
                veterinaryFacilities: userData.shelter.veterinaryFacilities,
                socialMedia: {
                  create: userData.shelter.socialMedia,
                },
              },
            }
          : undefined,
      },
    });
    console.log(`Usuario creado: ${user.username}`);
  }

  const [shelter1, shelter2] = await prisma.$transaction([
    prisma.user.findUnique({ where: { username: 'shelter1' } }),
    prisma.user.findUnique({ where: { username: 'shelter2' } }),
  ]);

  for (const animalData of animals) {
    // ID del refugio 2
    const shelter = getRandomShelterId(shelter1, shelter2);
    const slug = await prismaSlug.animal.generateUniqueSlug({
      name: animalData.name,
      shelter: shelter.username,
    });
    const animal = await prismaSlug.animal.create({
      data: {
        ...animalData,
        name: animalData.name.toLowerCase(),
        cat: animalData.cat
          ? {
              create: {
                kidsFriendly: animalData.cat.kidsFriendly,
                playLevel: animalData.cat.playLevel,
                scratchPotential: animalData.cat.scratchPotential,
                toiletTrained: animalData.cat.toiletTrained,
              },
            }
          : undefined,
        dog: animalData.dog
          ? {
              create: {
                bark: animalData.dog.bark,
                departmentAdapted: animalData.dog.departmentAdapted,
                droolingPotential: animalData.dog.droolingPotential,
              },
            }
          : undefined,
        slug,
        createdBy: shelter.id,
      },
    });
    console.log(`Animal creado: ${animal.name}`);
  }

  await prisma.$disconnect();
})();
