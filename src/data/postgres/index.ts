import { Prisma, PrismaClient } from '@prisma/client';
import { BcryptAdapter } from '../../config';

// Create a new instance of PrismaClient
export const prisma = new PrismaClient();

// Define an extension for handling password-related operations
const passwordExtension = Prisma.defineExtension({
  name: 'PasswordExtension',
  model: {
    user: {
      // Method to hash a password
      hashPassword: (password: string) => {
        const hash = BcryptAdapter.hash(password);
        return hash;
      },
      // Method to validate a password against its hash
      validatePassword: ({
        password,
        hash,
      }: {
        hash: string | null;
        password: string | null;
      }) => {
        if (password && hash) return BcryptAdapter.compare(password, hash);
      },
    },
  },
});

// Define an extension for generating unique slugs for animals
const slugExtension = Prisma.defineExtension({
  name: 'SlugExtension',
  model: {
    animal: {
      // Generate the initial slug based on the animal's name and shelter
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

        // Check if an animal with the generated slug already exists
        let existingAnimalWithSlug = await prisma.animal.findFirst({
          where: {
            slug,
          },
        });

        // If an animal with the slug already exists, append a suffix until a unique slug is found
        let suffix = 1;
        while (existingAnimalWithSlug) {
          slug = `${shelter}-${name
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/'/g, '')}${suffix}`;
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

// Define types for the extensions
export type PrismaSlugExtension = ReturnType<typeof slugExtension>;
export type PrismaPasswordExtension = ReturnType<typeof passwordExtension>;

// Extend the Prisma client with the slug extension
export const prismaWithSlugExtension = prisma.$extends(slugExtension);

// Extend the Prisma client with the password extension
export const prismaWithPasswordExtension = prisma.$extends(passwordExtension);
