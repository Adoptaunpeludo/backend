import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  BadRequestError,
  CustomAPIError,
  LoginUserDto,
  RegisterUserDto,
  UnauthorizedError,
} from '../../domain';
import { JWTAdapter } from '../../config';
import { EmailService } from './email.service';
import { InternalServerError, UnauthenticatedError } from '../../domain/errors';
import { CryptoAdapter } from '../../config/crypto.adapter';
import { ProducerService } from './producer.service';
import { PartialUserResponse, UserResponse } from '../../domain/interfaces';

interface Options {
  userAgent: string;
  ip: string;
}

type TokenType = 'passwordToken' | 'verificationToken';

export class AuthService {
  constructor(
    private readonly jwt: JWTAdapter,
    private readonly producerService: ProducerService,
    private readonly emailService?: EmailService,
    private readonly webServiceUrl?: string
  ) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const { email } = registerUserDto;

    const user = await prisma.user.findUnique({
      where: { email },
    });


    if (user)
      throw new BadRequestError(
        `Email ${registerUserDto.email} already exists, try another one`
      );

    const hashedPassword = prisma.user.hashPassword(registerUserDto.password);

    const verificationToken = this.jwt.generateToken(
      { user: { email } },
      '15m'
    );

    if (!verificationToken)
      throw new InternalServerError('JWT token error, check server logs');

    const createdUser = await prisma.user.create({
      data: {
        email: registerUserDto.email,
        password: hashedPassword,
        role: registerUserDto.role,
        username: registerUserDto.username,
        dni: registerUserDto.dni,
        firstName: registerUserDto.firstName,
        lastName: registerUserDto.lastName,
        verificationToken: verificationToken,
        shelter:
          registerUserDto.role === 'shelter'
            ? {
                create: {
                  cif: '',
                  description: '',
                  images: [],
                },
              }
            : undefined,
        contactInfo: {
          create: {
            phoneNumber: registerUserDto.phoneNumber,
            address: registerUserDto.address,
            cityId: registerUserDto.cityId,
          },
        },
      },
    });

    await this.producerService.addToEmailQueue({
      email: createdUser.email,
      verificationToken,
      type: 'email',
    });

    // Rollback in case there is an error sending the validation email
    // try {
    //   await this.sendEmailValidationLink(
    //     createdUser.email,
    //     verificationToken,
    //     'email'
    //   );
    // } catch (error) {
    //   await prisma.user.delete({ where: { email: createdUser.email } });
    //   throw error;
    // }

    return createdUser;
  }

  private async validateCredentials(loginUserDto: LoginUserDto) {

    const user = await prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) throw new UnauthorizedError('Incorrect email or password');

    const isMatch = prisma.user.validatePassword({
      password: loginUserDto.password,
      hash: user.password,
    });

    if (!isMatch) throw new UnauthorizedError('Incorrect email or password');

    if (!user.emailValidated)
      throw new UnauthenticatedError('Please first verify your email');

    return user;
  }

  private async generateCookies(
    user: PartialUserResponse,
    ip: string,
    userAgent: string
  ) {
    let token = '';

    const tokenExist = await prisma.token.findUnique({
      where: { userId: user.id },
    });

    if (tokenExist) {
      const { isValid } = tokenExist;
      if (!isValid) throw new UnauthenticatedError('Invalid Credentials');
      token = tokenExist.refreshToken;
    } else {
      token = CryptoAdapter.randomBytes(40, 'hex');
      const userToken = { refreshToken: token, ip, userAgent, userId: user.id };
      await prisma.token.create({ data: userToken });
    }

    const userToken = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.username,
    };

    const accessToken = this.jwt.generateToken({ user: userToken });

    const refreshToken = this.jwt.generateToken({
      user: userToken,
      refreshToken: token,
    });

    if (!accessToken || !refreshToken)
      throw new CustomAPIError(
        'Internal Server',
        'JWT token error, check server logs',
        500
      );

    return { accessToken, refreshToken };
  }

  public async loginUser(loginUserDto: LoginUserDto, options: Options) {
    const { userAgent, ip } = options;

    const user = await this.validateCredentials(loginUserDto);

    const { accessToken, refreshToken } = await this.generateCookies(
      user,
      ip,
      userAgent
    );

    return { accessToken, refreshToken };
  }

  public async logout(userId: string) {
    await prisma.token.delete({ where: { userId } });
  }

  private async verifyToken(token: string, type: TokenType) {
    const payload = this.jwt.validateToken(token);

    if (!payload) throw new UnauthorizedError('Invalid token validation');

    const { email } = payload.user;

    if (!email)
      throw new InternalServerError(
        'Wrong email from JWT token, check server logs'
      );

    const verifyUserToken = await prisma.user.findUnique({
      where: { email },
    });

    if (verifyUserToken?.[type] !== token)
      throw new UnauthenticatedError('Invalid token check');

    return email;
  }

  public async verifyEmail(token: string) {
    const email = await this.verifyToken(token, 'verificationToken');

    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailValidated: true,
        verifiedAt: new Date(),
        verificationToken: '',
      },
    });

    if (!user)
      throw new InternalServerError(
        'Email not exist from JWT payload, check server logs'
      );
  }

  public async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestError(`User with email: ${email} not found`);

    const passwordToken = this.jwt.generateToken(
      { user: { email, id: user.id, name: user.username, role: user.role } },
      '15m'
    );

    if (!passwordToken)
      throw new CustomAPIError(
        'Internal Server',
        'JWT token error, check server logs',
        500
      );

    await prisma.user.update({ data: { passwordToken }, where: { email } });

    await this.producerService.addToEmailQueue({
      email,
      passwordToken,
      type: 'password',
    });

    // try {
    //   await this.sendEmailValidationLink(email, passwordToken, 'password');
    // } catch (error) {
    //   await prisma.user.update({
    //     data: { passwordToken: '' },
    //     where: { email },
    //   });
    //   throw error;
    // }

    return passwordToken;
  }

  public async resetPassword(password: string, token: string) {
    const email = await this.verifyToken(token, 'passwordToken');

    const hash = prisma.user.hashPassword(password);

    const user = await prisma.user.update({
      data: { password: hash, passwordToken: '' },
      where: { email },
    });

    if (!user)
      throw new InternalServerError(
        'Email not exist from JWT payload, check server logs'
      );
  }
}
