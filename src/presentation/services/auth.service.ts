import { prisma } from '../../data/postgres';
import {
  BadRequestError,
  CustomAPIError,
  LoginUserDto,
  RegisterUserDto,
  UnauthorizedError,
} from '../../domain';
import { BcryptAdapter, JWTAdapter } from '../../config';
import { EmailService } from './email.service';
import { InternalServerError, UnauthenticatedError } from '../../domain/errors';
import { CryptoAdapter } from '../../config/crypto.adapter';
import { ProducerService } from './producer.service';

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
    const { email, role } = registerUserDto;

    const existUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existUser)
      throw new BadRequestError(
        `Email ${registerUserDto.email} already exists, try another one`
      );

    const hashedPassword = BcryptAdapter.hash(registerUserDto.password);

    const verificationToken = await this.jwt.generateToken(
      { user: { email } },
      '15m'
    );

    if (!verificationToken)
      throw new InternalServerError('JWT token error, check server logs');

    const createdUser = await prisma.user.create({
      data: {
        email: registerUserDto.email,
        password: hashedPassword,
        username: registerUserDto.username || '',
        role: registerUserDto.role,
        verificationToken,
        contactInfo: {
          create: {
            phoneNumber: '',
            cityId: null,
            address: '',
          },
        },
        adopter:
          role === 'adopter'
            ? {
                create: {
                  firstName: '',
                  lastName: '',
                },
              }
            : undefined,
        shelter:
          role === 'shelter'
            ? {
                create: {
                  name: '',
                  description: '',
                  animals: undefined,
                  socialMedia: undefined,
                },
              }
            : undefined,
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

  public async loginUser(loginUserDto: LoginUserDto, options: Options) {
    const { userAgent, ip } = options;

    const user = await prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) throw new UnauthorizedError('Incorrect email or password');

    const isMatch = BcryptAdapter.compare(loginUserDto.password, user.password);

    if (!isMatch) throw new UnauthorizedError('Incorrect email or password');

    if (!user.emailValidated)
      throw new UnauthenticatedError('Please first verify your email');

    //* Refresh token
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

    const accessToken = await this.jwt.generateToken({ user: userToken });

    const refreshToken = await this.jwt.generateToken({
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

  public async logout(userId: string) {
    await prisma.token.delete({ where: { userId } });
  }

  private generateEmailContent(type: string, token: string, email: string) {
    const endPoint = type === 'email' ? 'verify-email' : 'reset-password';
    const title = type === 'email' ? 'Valida tu Email' : 'Cambia tu password';
    const action =
      type === 'email' ? 'validar tu email' : 'cambiar tu password';

    const link = `${this.webServiceUrl}/user/${endPoint}?token=${token}&email=${email}`;

    const html = `
        <h1>${title}</h1>
        <p>Por favor haz click en el siguiente link para ${action}</p>
        <a href="${link}">${title}</a>
    `;

    return { html, title };
  }

  private async sendEmailValidationLink(
    email: string,
    token: string,
    type: string
  ) {
    if (!token)
      throw new InternalServerError(
        'Error while generating JWT token, check server logs'
      );

    const { html, title } = this.generateEmailContent(type, token, email);

    const options = {
      to: email,
      subject: title,
      htmlBody: html,
    };

    const isSent = await this.emailService!.sendEmail(options);

    if (!isSent)
      throw new InternalServerError('Error sending email, check server logs');

    return true;
  }

  private async verifyToken(token: string, type: TokenType) {
    const payload = await this.jwt.validateToken(token);

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
        verified: new Date(),
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

    const passwordToken = await this.jwt.generateToken(
      { user: { email } },
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

    const hash = BcryptAdapter.hash(password);

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
