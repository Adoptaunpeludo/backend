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

(async () => {
  await prisma.$connect();

  const confirmation = await confirmationQuestion(
    'Are you sure do you want to wipe and repopulate the database? (yes/no): '
  );

  if (!confirmation) process.exit();

  await Promise.all(
    seedData.map(async (userData) => {
      const createdUser = await prisma.users.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: userData.password,
          address: userData.direccion,
          phone_number: userData.telefono,
          adopter:
            userData.type === 'adopter'
              ? {
                  create: {
                    name: userData.nombre,
                    second_name: userData.apellidos!,
                    dni: userData.dni!,
                  },
                }
              : undefined,
          shelter:
            userData.type === 'shelter'
              ? {
                  create: {
                    cif: userData.cif!,
                    name: userData.nombre,
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
