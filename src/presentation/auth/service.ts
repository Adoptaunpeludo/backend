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
import { QueueService, S3Service } from '../shared/services';
import {
  PartialUserResponse,
  SocialMedia,
  UserRoles,
} from '../../domain/interfaces';
import { OAuth2Client } from 'google-auth-library';

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
    private readonly emailService: QueueService,
    private readonly client: OAuth2Client,
    private readonly s3Service: S3Service,
    private readonly notificationService: QueueService
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

    if (!payload) throw new UnauthorizedError('Validación de token fallida');

    const { email } = payload.user;

    if (!email)
      throw new InternalServerError(
        'Email incorrecto en el JWT token, contacte con soporte'
      );

    const verifyUserToken = await prisma.user.findUnique({
      where: { email },
    });

    if (verifyUserToken?.[type] !== token)
      throw new UnauthenticatedError('Validación de token fallida');

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
      if (!isValid) throw new UnauthenticatedError('Credenciales inválidas');
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
        'Error al generar el Token JWT, contacte con soporte',
        500
      );

    return { accessToken, refreshToken };
  }

  /**
   * Creates empty social media entries for a shelter user.
   * @param createdUser - The user object created in the system.
   */
  private async createEmptySocialMedia(createdUser: any) {
    if (createdUser.role !== 'shelter') return;

    // Define social media objects with default values
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
   * Uploads a user's picture to Amazon S3 storage.
   * @param userId - The ID of the user.
   * @param pictureUrl - The URL of the picture to be uploaded.
   * @returns The S3 key where the picture is stored.
   * @throws Error if failed to fetch the picture from the URL.
   */
  public async uploadPictureToS3(userId: string, pictureUrl: string) {
    // Fetch the picture from the URL
    const response = await fetch(pictureUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch picture from URL: ${pictureUrl}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const key = `users/${userId}/googleAvatar.jpg`;

    await this.s3Service.uploadFile(key, buffer);

    return key;
  }

  /**
   * Registers a user using Google authentication.
   * @param credential - The authentication credential received from Google.
   * @param clientId - The client ID for Google authentication.
   * @param role - The role of the user.
   * @param options - Additional options including IP and user agent.
   * @returns An object containing access and refresh tokens.
   * @throws InternalServerError if no payload is received from Google Auth.
   */
  public async googleAuthRegister(
    credential: string,
    clientId: string,
    role: UserRoles,
    options: Options
  ) {
    const { ip, userAgent } = options;
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload)
      throw new InternalServerError('Error de OAuth, consulte con soporte');

    const user = await this.registerUser(
      {
        email: payload.email!,
        role,
        username: payload.name?.toLowerCase() || '',
      },
      'googleAuth',
      payload.picture || ''
    );

    const { accessToken, refreshToken } = await this.generateCookies(
      user,
      ip,
      userAgent
    );

    return { accessToken, refreshToken };
  }

  /**
   * Logs in a user using Google authentication.
   * @param credential - The authentication credential received from Google.
   * @param clientId - The client ID for Google authentication.
   * @param options - Additional options including IP and user agent.
   * @returns An object containing access and refresh tokens.
   * @throws InternalServerError if no payload is received from Google Auth.
   * @throws BadRequestError if the user is not found in the system.
   */
  public async googleAuthLogin(
    credential: string,
    clientId: string,
    options: Options
  ) {
    const { ip, userAgent } = options;
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload)
      throw new InternalServerError('Error de OAuth, consulte con soporte');

    const userExist = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!userExist)
      throw new BadRequestError(
        'Usuario no encontrado, registate primero con Google como Adoptante o Refugio por favor'
      );

    const { accessToken, refreshToken } = await this.generateCookies(
      userExist,
      ip,
      userAgent
    );

    return { accessToken, refreshToken };
  }

  /**
   * Registers a new user.
   * @param registerUserDto - DTO containing user registration data.
   * @returns The newly created user.
   * @throws BadRequestError if the email provided already exists.
   * @throws InternalServerError if there's an issue with JWT token generation.
   */
  public async registerUser(
    registerUserDto: RegisterUserDto,
    type: string = 'self',
    avatar: string = ''
  ) {
    const { email, username } = registerUserDto;

    // Check if the user already exists
    const userEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userEmail)
      throw new BadRequestError(
        `El email ${registerUserDto.email} ya existe, pruebe con otro`
      );

    const userUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (userUsername)
      throw new BadRequestError(
        `El nombre de usuario ${registerUserDto.username} está siendo utilizado, pruebe con otro`
      );

    let createdUser;

    // Traditional register
    if (type !== 'googleAuth') {
      //* Hash password and generate email verificationToken
      const hashedPassword = prisma.user.hashPassword(
        registerUserDto.password!
      );

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

      createdUser = await prisma.user.create({
        data,
      });

      //* Send an verification email to queue
      await this.emailService.addMessageToQueue(
        {
          email: createdUser.email,
          verificationToken,
          type: 'email',
        },
        'verify-email'
      );

      // OAuth Google Register
    } else {
      createdUser = await prisma.user.create({
        data: {
          email: registerUserDto.email,
          role: registerUserDto.role,
          username: registerUserDto.username,
          emailValidated: true,
          accountType: 'google',
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
        },
      });
      const avatarUrl = await this.uploadPictureToS3(createdUser.id, avatar);

      await prisma.user.update({
        where: {
          id: createdUser.id,
        },
        data: {
          avatar: [avatarUrl],
        },
      });
    }

    await this.createEmptySocialMedia(createdUser);

    // Notify that a new shelter had been created
    if (createdUser.role === 'shelter')
      this.notificationService.addMessageToQueue(
        {
          action: 'user-created',
          username: createdUser.username,
          role: createdUser.role,
        },
        'user-changed-notification'
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

    if (!user) throw new NotFoundError('Usuario no encontrado');

    if (user.emailValidated)
      throw new BadRequestError('El email ya ha sido validado');

    const verificationToken = this.jwt.generateToken(
      { user: { email } },
      '15m'
    );

    if (!verificationToken)
      throw new InternalServerError(
        'Error al generar el Token JWT, contacte con soporte'
      );

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

    if (!user) throw new UnauthorizedError('Email o password incorrectos');

    if (user.accountType === 'google')
      throw new BadRequestError(
        'Registrado con una cuenta de Google, haz login con tu cuenta de Google por favor.'
      );

    const isMatch = prisma.user.validatePassword({
      password: loginUserDto.password,
      hash: user.password,
    });

    if (!isMatch) throw new UnauthorizedError('Email o password incorrectos');

    if (!user.emailValidated)
      throw new UnauthenticatedError('Por favor, primero verifica tu email');

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
        'Error al extraer los datos de usuario del Token JWT, contacte con soporte'
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

    if (!user)
      throw new BadRequestError(`Usuario con el email: ${email} no encontrado`);

    if (user.accountType === 'google')
      throw new BadRequestError(
        'No se puede recuperar un password de una cuenta de Google'
      );

    const passwordToken = this.jwt.generateToken(
      { user: { email, id: user.id, name: user.username, role: user.role } },
      '15m'
    );

    if (!passwordToken)
      throw new CustomAPIError(
        'Internal Server',
        'Error generando Token JWT, contacte con soporte',
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
        'Error al extraer datos del Token JWT, contacte con soporte'
      );
  }
}
