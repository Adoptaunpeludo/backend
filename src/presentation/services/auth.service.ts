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
import { InternalServerError } from '../../domain/errors';

export class AuthService {
  constructor(
    private readonly jwt: JWTAdapter,
    private readonly emailService: EmailService,
    private readonly webServiceUrl: string
  ) {}

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

    // Rollback in case there is an error sending the validation email
    try {
      await this.sendEmailValidationLink(createdUser.email);
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

  private sendEmailValidationLink = async (email: string) => {
    //* TODO: Decrease token duration
    const token = await this.jwt.generateToken({ email });
    if (!token)
      throw new InternalServerError(
        'Error while generating JWT token, check server logs'
      );

    const link = `${this.webServiceUrl}/auth/validate-email/${token}`;
    const html = `
        <h1>Valida tu email</h1>
        <p>Por favor haz click en el siguiente link para validar tu email</p>
        <a href="${link}">Validar el email: ${email}</a>
    `;

    const options = {
      to: email,
      subject: 'Validación de email',
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);

    if (!isSent)
      throw new InternalServerError('Error sending email, check server logs');

    return true;
  };

  public async validateEmail(token: string) {
    const payload = await this.jwt.validateToken(token);

    if (!payload) throw new UnauthorizedError('Invalid token');

    const { email } = payload;

    if (!email)
      throw new InternalServerError(
        'Wrong email from JWT payload, check server logs'
      );

    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailValidated: true,
      },
    });

    if (!user)
      throw new InternalServerError(
        'Email not exist form JWT payload, check server logs'
      );
  }
}
