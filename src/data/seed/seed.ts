import { createInterface } from 'readline';
import { prisma } from '../postgres';
import { seedData } from './data';

const confirmationQuestion = (text: string) => {
  return new Promise((resolve) => {
    // conectar readline con la consola
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

  if (!confirmation) process.exit();

  // await prisma.contactInfo.deleteMany();
  // await prisma.adopter.deleteMany();
  // await prisma.shelter.deleteMany();
  await prisma.users.deleteMany();

  // await Promise.all(
  //   seedData.map(async (userData) => {
  //     const createdUser = await prisma.users.create({
  //       data: {
  //         email: userData.email,
  //         username: userData.username,
  //         password: userData.password,
  //         contactInfo: {
  //           create: {
  //             address: userData?.direccion,
  //             phone_number: userData?.telefono,
  //           },
  //         },
  //         adopter: userData?.dni
  //           ? {
  //               create: {
  //                 name: userData.nombre,
  //                 second_name: userData.apellidos!,
  //                 dni: userData.dni!,
  //               },
  //             }
  //           : undefined,
  //         shelter: userData?.cif
  //           ? {
  //               create: {
  //                 cif: userData.cif!,
  //                 name: userData.nombre,
  //               },
  //             }
  //           : undefined,
  //       },
  //     });
  //     console.log(`User created: ${JSON.stringify(createdUser)}`);
  //   })
  // );

  await prisma.$disconnect();
})();
