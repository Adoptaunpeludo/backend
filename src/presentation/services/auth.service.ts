import { prisma } from '../../data/postgres';
import { RegisterUserDto } from '../../domain/dtos/register-user.dto';
import { BadRequestError } from '../../domain/errors';
import { BcryptAdapter } from '../../config/bcrypt.adapter';

export class AuthService {
  constructor() {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (existUser)
      throw new BadRequestError(
        `Email ${registerUserDto.email} already exists, try another one`
      );

    const hashedPassword = BcryptAdapter.hash(registerUserDto.password);

    const createdUser = await prisma.user.create({
      data: {
        email: registerUserDto.email,
        password: hashedPassword,
        username: registerUserDto.username || '',
        role: registerUserDto.role,
      },
    });

    return createdUser;
  }
}
