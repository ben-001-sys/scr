/**
 * This service contains the business logic for the auth feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the auth controller and forms the main bridge between API requests and stored data.
 */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import RegisterDto from ./dto/register.dto because this local file is part of the same feature or folder.
import { RegisterDto } from './dto/register.dto';
// Import AuthResponseDto from ./dto/auth-response.dto because this local file is part of the same feature or folder.
import { AuthResponseDto } from './dto/auth-response.dto';
// Import bcrypt so sensitive passwords or token-like values can be hashed or compared securely.
import * as bcrypt from 'bcrypt';
// Import Node's crypto helper to generate random values used in the authentication flow.
import { randomBytes } from 'crypto';
// Import JWT helpers used to create or validate JSON Web Tokens in the auth flow.
import { JwtService } from '@nestjs/jwt';
// Import LoginDto from ./dto/login.dto because this local file is part of the same feature or folder.
import { LoginDto } from './dto/login.dto';
// Import the configuration service so this file can read environment-based settings such as secrets and expiry times.
import { ConfigService } from '@nestjs/config';

@Injectable()
/**
 * The AuthService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  //   Register a new user
  /**
   * This method creates a brand-new user account.
   * It expects validated registration data and returns tokens plus the newly created user details.
   * It is important because it is the first step into the authenticated part of the system.
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Ask Prisma for one user record using a unique field such as an id or email.
    const existingUser = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
      // Ask Prisma to create a new user record in the database using the data provided below.
      const user = await this.prisma.user.create({
        // data contains the values Prisma should write into the database.
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: false,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);

      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException(
        'An error occurred during registration',
      );
    }
  }

  // Generate access and refresh tokens
  /**
   * This helper builds the access token and refresh token used by the auth system.
   * It expects the user identifier and email, and it returns both signed token strings.
   * It is important because several auth flows depend on one consistent token-creation rule.
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.jwtService.signAsync(
        { ...payload, refreshId },
        {
          expiresIn: '7d',
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // Update refresh token in the database
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // Ask Prisma to update an existing user record that matches the given where condition.
    await this.prisma.user.update({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // Refresh access token
  /**
   * This method creates fresh authentication tokens for an already authenticated user.
   * It expects trusted token-related user information and returns new token values.
   * It is important because access tokens are short-lived and need a safe renewal path.
   */
  async refreshTokens(userId: string): Promise<AuthResponseDto> {
    // Ask Prisma for one user record using a unique field such as an id or email.
    const user = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
      // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  // Log out
  /**
   * This method ends the current authenticated session on the server side.
   * It expects the current user identifier and returns either nothing or a simple success message.
   * It is important because it prevents old refresh tokens from being reused.
   */
  async logout(userId: string): Promise<void> {
    // Ask Prisma to update an existing user record that matches the given where condition.
    await this.prisma.user.update({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // Login
  /**
   * This method checks user credentials and creates authentication tokens.
   * It expects login input and returns token data plus a safe version of the user record.
   * It is important because it starts the authenticated session for the API client.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Ask Prisma for one user record using a unique field such as an id or email.
    const user = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
