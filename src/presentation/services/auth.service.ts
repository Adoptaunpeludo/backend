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

export class AuthService {
  constructor(
    private readonly jwt: JWTAdapter,
    private readonly emailService: EmailService,
    private readonly webServiceUrl: string
  ) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const { email } = registerUserDto;

    const existUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existUser)
      throw new BadRequestError(
        `Email ${registerUserDto.email} already exists, try another one`
      );

    const hashedPassword = BcryptAdapter.hash(registerUserDto.password);

    const verificationToken = await this.jwt.generateToken({ email }, '15m');

    if (!verificationToken)
      throw new CustomAPIError(
        'Internal Server',
        'JWT token error, check server logs',
        500
      );

    const createdUser = await prisma.user.create({
      data: {
        email: registerUserDto.email,
        password: hashedPassword,
        username: registerUserDto.username || '',
        role: registerUserDto.role,
        verificationToken,
      },
    });

    // Rollback in case there is an error sending the validation email
    try {
      await this.sendEmailValidationLink(
        createdUser.email,
        verificationToken,
        'email'
      );
    } catch (error) {
      await prisma.user.delete({ where: { email: createdUser.email } });
      throw error;
    }

    return createdUser;
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) throw new UnauthorizedError('Incorrect email or password');

    const isMatch = BcryptAdapter.compare(loginUserDto.password, user.password);

    if (!isMatch) throw new UnauthorizedError('Incorrect email or password');

    if (!user.emailValidated)
      throw new UnauthenticatedError('Please first verify your email');

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

  private sendEmailValidationLink = async (
    email: string,
    token: string,
    type: string
  ) => {
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

    const isSent = await this.emailService.sendEmail(options);

    if (!isSent)
      throw new InternalServerError('Error sending email, check server logs');

    return true;
  };

  public async verifyEmail(token: string) {
    const payload = await this.jwt.validateToken(token);

    if (!payload) throw new UnauthorizedError('Invalid token validation');

    const { email } = payload;

    if (!email)
      throw new InternalServerError(
        'Wrong email from JWT token, check server logs'
      );

    const verifyUserToken = await prisma.user.findUnique({
      where: { email },
    });

    if (verifyUserToken?.verificationToken !== token)
      throw new UnauthenticatedError('Invalid token check');

    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailValidated: true,
        verified: new Date(),
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

    const passwordToken = await this.jwt.generateToken({ email }, '15m');

    if (!passwordToken)
      throw new CustomAPIError(
        'Internal Server',
        'JWT token error, check server logs',
        500
      );

    await prisma.user.update({ data: { passwordToken }, where: { email } });

    try {
      await this.sendEmailValidationLink(email, passwordToken, 'password');
    } catch (error) {
      await prisma.user.update({
        data: { passwordToken: '' },
        where: { email },
      });
      throw error;
    }
  }

  public async resetPassword(password: string, token: string) {
    const payload = await this.jwt.validateToken(token);

    if (!payload) throw new UnauthorizedError('Invalid token validation');

    const { email } = payload;

    if (!email)
      throw new InternalServerError(
        'Wrong email from JWT token, check server logs'
      );

    const verifyUserToken = await prisma.user.findUnique({
      where: { email },
    });

    if (verifyUserToken?.passwordToken !== token)
      throw new UnauthenticatedError('Invalid token check');

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
