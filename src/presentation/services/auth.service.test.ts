import { JWTAdapter } from '../../config';
import { prisma } from '../../data/postgres';
import { InternalServerError, RegisterUserDto } from '../../domain';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';

describe('auth.service.ts', () => {
  const cleanDB = async () => {
    await prisma.$transaction([
      prisma.socialMedia.deleteMany(),
      prisma.contactInfo.deleteMany(),
      prisma.adopter.deleteMany(),
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
      new EmailService('', '', ''),
      'https://example.com'
    );

    await expect(authService.registerUser(registerUserDto)).rejects.toThrow(
      InternalServerError
    );
  });

  test('should throw CustomAPIError if EmailService fails', async () => {
    // Arrange

    const jwt = new JWTAdapter('secret');

    prisma.user.delete = jest.fn();

    const emailService = new EmailService('', '', '');

    const authService = new AuthService(
      jwt,
      emailService,
      'https://example.com'
    );

    await expect(authService.registerUser(registerUserDto)).rejects.toThrow(
      InternalServerError
    );

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { email: registerUserDto.email },
    });
  });
});
