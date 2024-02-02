import { createInterface } from 'readline';
import { prisma } from '../postgres';
import { citiesData, seedData } from './data';

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

// async function deleteUserAndAssociatedData() {
//   try {
//     await prisma.$transaction([
//       prisma.contactInfo.deleteMany({ where: { userID: '1' } }),
//       prisma.adopter.delete({ where: { adopterID: '1' } }),
//       prisma.shelter.delete({ where: { shelterID: '1' } }),
//       prisma.users.delete({ where: { userID: '1' } }),
//     ]);

//     console.log('User and associated data deleted successfully.');
//   } catch (error) {
//     console.error('Error deleting user and associated data:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

(async () => {
  await prisma.$connect();

  const confirmation = await confirmationQuestion(
    'Are you sure do you want to wipe and repopulate the database? (yes/no): '
  );

  if (!confirmation) {
    await prisma.$disconnect();
    process.exit();
  }

  // await prisma.contactInfo.deleteMany();
  // await prisma.adopter.deleteMany();
  // await prisma.shelter.deleteMany();
  await prisma.user.deleteMany();

  const cities = await prisma.city.findMany();
  if (cities.length === 0) {
    const citiesNames = citiesData.map((city) => ({
      name: city.label,
    }));

    await prisma.city.createMany({ data: citiesNames });
  }

  await Promise.all(
    seedData.map(async (userData) => {
      const createdUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          username: 'test',
          contact_info: {
            create: {
              phone_number: userData.contactInfo.phone_number,
              city_id: userData.contactInfo.cityID,
            },
          },
          adopter:
            userData.role === 'adopter'
              ? {
                  create: {
                    first_name: userData.first_name!,
                    last_name: userData.last_name!,
                    role: userData.role,
                  },
                }
              : undefined,
          shelter:
            userData.role === 'shelter'
              ? {
                  create: {
                    name: userData.name!,
                    role: userData.role,
                  },
                }
              : undefined,
          admin:
            userData.role === 'admin'
              ? {
                  create: {
                    name: userData.name!,
                    role: userData.role,
                  },
                }
              : undefined,
        },
      });
      console.log(`User created: ${JSON.stringify(createdUser)}`);
    })
  );

  await prisma.$disconnect();
})();
