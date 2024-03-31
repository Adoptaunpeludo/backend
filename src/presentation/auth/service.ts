import { prismaWithPasswordExtension as prisma } from '../../data/postgres';
import {
  BadRequestError,
  CustomAPIError,
  LoginUserDto,
  RegisterUserDto,
  UnauthorizedError,
} from '../../domain';
import { JWTAdapter } from '../../config';
import {
  InternalServerError,
  NotFoundError,
  UnauthenticatedError,
} from '../../domain/errors';
import { CryptoAdapter } from '../../config/crypto.adapter';
import { QueueService } from '../common/services';
import { PartialUserResponse, SocialMedia } from '../../domain/interfaces';

interface Options {
  userAgent: string;
  ip: string;
}

type TokenType = 'passwordToken' | 'verificationToken';

/**
 * AuthService class handles user authentication and authorization.
 * It provides methods for user registration, login, logout,
 * email verification, password reset, and other related functionalities.
 */
export class AuthService {
  constructor(
    private readonly jwt: JWTAdapter,
    private readonly emailService: QueueService
  ) {}

  /**
   * Verifies the validity of a token.
   * @param token - The token to verify.
   * @param type - The type of token ('passwordToken' or 'verificationToken').
   * @returns The email associated with the token.
   * @throws UnauthorizedError if the token is invalid.
   * @throws InternalServerError if there's an issue with the server.
   */
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

  /**
   * Builds the data object required for user creation.
   * @param registerUserDto - DTO containing user registration data.
   * @param hashedPassword - The hashed user password.
   * @param verificationToken - Token for email verification.
   * @returns Data object for user creation.
   */
  private buildQuery(
    registerUserDto: RegisterUserDto,
    hashedPassword: string,
    verificationToken: string
  ) {
    return {
      email: registerUserDto.email,
      password: hashedPassword,
      role: registerUserDto.role,
      username: registerUserDto.username,
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
    };
  }

  /**
   * Generates access and refresh tokens for the user.
   * @param user - PartialUserResponse object containing user information.
   * @param ip - IP address of the user.
   * @param userAgent - User agent string of the user's browser.
   * @returns Object containing access and refresh tokens.
   * @throws CustomAPIError if there's an issue with JWT token generation.
   */
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

  private async createEmptySocialMedia(createdUser: any) {
    if (createdUser.role !== 'shelter') return;

    const socialMedia: SocialMedia[] = [
      {
        shelterId: createdUser.id,
        url: '',
        name: 'facebook',
      },
      {
        shelterId: createdUser.id,
        url: '',
        name: 'xtweet',
      },
      {
        shelterId: createdUser.id,
        url: '',
        name: 'instagram',
      },
    ];

    await prisma.socialMedia.createMany({
      data: socialMedia,
    });
  }

  /**
   * Registers a new user.
   * @param registerUserDto - DTO containing user registration data.
   * @returns The newly created user.
   * @throws BadRequestError if the email provided already exists.
   * @throws InternalServerError if there's an issue with JWT token generation.
   */
  public async registerUser(registerUserDto: RegisterUserDto) {
    const { email, username } = registerUserDto;

    //* Check if the user already exists
    const userEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userEmail)
      throw new BadRequestError(
        `Email ${registerUserDto.email} already exists, try another one`
      );

    const userUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (userUsername)
      throw new BadRequestError(
        `Username ${registerUserDto.username} already exists, try another one`
      );

    //* Hash password and generate email verificationToken
    const hashedPassword = prisma.user.hashPassword(registerUserDto.password);

    const verificationToken = this.jwt.generateToken(
      { user: { email } },
      '15m'
    );

    if (!verificationToken)
      throw new InternalServerError('JWT token error, check server logs');

    //* Build query for user creation and create user
    const data = this.buildQuery(
      registerUserDto,
      hashedPassword,
      verificationToken
    );

    const createdUser = await prisma.user.create({
      data,
    });

    await this.createEmptySocialMedia(createdUser);

    //* Send an verification email to queue
    await this.emailService.addMessageToQueue(
      {
        email: createdUser.email,
        verificationToken,
        type: 'email',
      },
      'verify-email'
    );

    return createdUser;
  }

  /**
   * Resends the validation email to a user.
   * @param email - The email of the user.
   * @returns The new verification token.
   * @throws NotFoundError if the user with the provided email is not found.
   * @throws BadRequestError if the user's email is already validated.
   * @throws InternalServerError if there's an issue with JWT token generation.
   */
  public async resendValidationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundError('User not found');

    if (user.emailValidated)
      throw new BadRequestError('Email already validated');

    const verificationToken = this.jwt.generateToken(
      { user: { email } },
      '15m'
    );

    if (!verificationToken)
      throw new InternalServerError('JWT token error, check server logs');

    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
      },
    });

    await this.emailService.addMessageToQueue(
      {
        email,
        verificationToken,
        type: 'email',
      },
      'verify-email'
    );

    return verificationToken;
  }

  /**
   * Validates the user's credentials during login.
   * @param loginUserDto - DTO containing user login data.
   * @returns The validated user.
   * @throws UnauthorizedError if the email or password is incorrect.
   * @throws UnauthenticatedError if the user's email is not validated.
   */
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

  /**
   * Logs in a user.
   * @param loginUserDto - DTO containing user login data.
   * @param options - Object containing user's IP address and user agent.
   * @returns Object containing access and refresh tokens.
   */
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

  /**
   * Logs out a user.
   * @param userId - The ID of the user to log out.
   */
  public async logout(userId: string) {
    await prisma.token.delete({ where: { userId } });
  }

  /**
   * Verifies the user's email using the verification token.
   * @param token - The verification token sent to the user's email.
   * @throws InternalServerError if there's an issue with the verification process.
   */
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

  /**
   * Initiates the process of password reset for a user.
   * @param email - The email of the user requesting password reset.
   * @returns The password reset token.
   * @throws BadRequestError if the user with the provided email is not found.
   * @throws CustomAPIError if there's an issue with JWT token generation.
   */
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

    await this.emailService.addMessageToQueue(
      {
        email,
        verificationToken: passwordToken,
        type: 'password',
      },
      'change-password'
    );

    return passwordToken;
  }

  /**
   * Resets the user's password using the password reset token.
   * @param password - The new password provided by the user.
   * @param token - The password reset token sent to the user's email.
   * @throws InternalServerError if there's an issue with the password reset process.
   */
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
