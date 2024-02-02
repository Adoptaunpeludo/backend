import { prisma } from '../../data/postgres';
import {
  BadRequestError,
  CustomAPIError,
  LoginUserDto,
  RegisterUserDto,
  UnauthorizedError,
} from '../../domain';
import { BcryptAdapter } from '../../config';
import { JWTAdapter } from '../../config/jwt.adapter';

export class AuthService {
  constructor(private readonly jwt: JWTAdapter) {}

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

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) throw new UnauthorizedError('Incorrect email or password');

    const isMatch = BcryptAdapter.compare(loginUserDto.password, user.password);

    if (!isMatch) throw new UnauthorizedError('Incorrect email or password');

    const token = this.jwt.generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.username,
    });

    if (!token)
      throw new CustomAPIError(
        'Internal Server',
        'JWT token error, check server logs',
        500
      );

    return token;
  }
}
