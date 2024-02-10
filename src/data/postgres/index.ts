import { Prisma, PrismaClient } from '@prisma/client';
import { BcryptAdapter } from '../../config';

export const prisma = new PrismaClient();

const passwordExtension = Prisma.defineExtension({
  name: 'PasswordExtension',
  model: {
    user: {
      hashPassword: (password: string) => {
        const hash = BcryptAdapter.hash(password);
        return hash;
      },
      validatePassword: ({
        password,
        hash,
      }: {
        hash: string;
        password: string;
      }) => {
        return BcryptAdapter.compare(password, hash);
      },
    },
  },
});

const slugExtension = Prisma.defineExtension({
  name: 'SlugExtension',
  model: {
    animal: {
      generateUniqueSlug: async ({
        name,
        shelter,
      }: {
        name: string;
        shelter: string;
      }) => {
        let slug = `${shelter}-${name
          .toLowerCase()
          .replace(/ /g, '_')
          .replace(/'/g, '')}`;

        let existingAnimalWithSlug = await prisma.animal.findFirst({
          where: {
            slug,
          },
        });

        let suffix = 1;
        while (existingAnimalWithSlug) {
          slug = `${shelter}-${name
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/'/g, '')}-${suffix}`;
          existingAnimalWithSlug = await prisma.animal.findFirst({
            where: {
              slug,
            },
          });
          suffix++;
        }

        return slug;
      },
    },
  },
});

export const prismaWithSlugExtension = prisma.$extends(slugExtension);
export const prismaWithPasswordExtension = prisma.$extends(passwordExtension);
