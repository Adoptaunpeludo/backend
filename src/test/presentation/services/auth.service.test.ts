import 'reflect-metadata';
import { JWTAdapter } from '../../../config';
import { prisma } from '../../../data/postgres';
import { InternalServerError, RegisterUserDto } from '../../../domain';
import { AuthService } from '../../../presentation/services/auth.service';
import { EmailService } from '../../../presentation/services/email.service';
import { ProducerService } from '../../../presentation/services/producer.service';

jest.mock('../../../presentation/services/producer.service');

describe('auth.service.ts', () => {
  const cleanDB = async () => {
    await prisma.$transaction([
      prisma.socialMedia.deleteMany(),
      prisma.contactInfo.deleteMany(),
      prisma.shelter.deleteMany(),
      prisma.admin.deleteMany(),
      prisma.token.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  };

  const registerUserDto = new RegisterUserDto();
  registerUserDto.username = 'john';
  registerUserDto.email = 'john@example.com';
  registerUserDto.password = 'password123';
  registerUserDto.role = 'adopter';

  afterEach(async () => {
    await cleanDB();
  });

  test('should throw CustomAPIError if JWT token fails to generate', async () => {
    // Arrange

    const jwt = new JWTAdapter('secret');

    jwt.generateToken = jest.fn().mockReturnValue(null);

    const authService = new AuthService(
      jwt,
      new ProducerService('', ''),
      new EmailService('', '', ''),
      'https://example.com'
    );

    await expect(authService.registerUser(registerUserDto)).rejects.toThrow(
      InternalServerError
    );
  });
});