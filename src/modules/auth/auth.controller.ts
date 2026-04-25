/**
 * This controller defines the HTTP endpoints for the auth feature.
 * It receives requests, reads route parameters or request bodies, and forwards the real work to the matching service.
 * It sits between incoming API calls and the auth service layer, often combining guards, decorators, and Swagger documentation.
 */
// Import NestJS decorators and helpers used to define routes, read request data, and control HTTP behavior.
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
// Import AuthService from ./auth.service because this local file is part of the same feature or folder.
import { AuthService } from './auth.service';
// Import RegisterDto from ./dto/register.dto because this local file is part of the same feature or folder.
import { RegisterDto } from './dto/register.dto';
// Import AuthResponseDto from ./dto/auth-response.dto because this local file is part of the same feature or folder.
import { AuthResponseDto } from './dto/auth-response.dto';
// Import RefreshTokenGuard from ./guards/refresh-token.guard because this local file is part of the same feature or folder.
import { RefreshTokenGuard } from './guards/refresh-token.guard';
// Import GetUser from src/common/decorators/get-user.decorator so this file can use another shared part of the application.
import { GetUser } from 'src/common/decorators/get-user.decorator';
// Import JwtAuthGuard from src/common/guards/jwt-auth.guard so this file can use another shared part of the application.
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// Import LoginDto from ./dto/login.dto because this local file is part of the same feature or folder.
import { LoginDto } from './dto/login.dto';
// Import Swagger decorators and builders so this API can describe itself in the generated docs.
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Controller sets the base route prefix, so every method in this class starts with /auth.
@Controller('auth')
/**
 * The AuthController class handles HTTP requests for this feature.
 * Controllers translate web requests into service calls and return the result back to the client.
 * This controller is used by NestJS when a matching route is called.
 */
export class AuthController {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private readonly authService: AuthService) {}

  //   Register api
  // Post means this endpoint listens for HTTP POST requests at /auth/register.
  @Post('register')
  // HttpCode sets the success status explicitly so the API contract is clear to clients.
  @HttpCode(201)
  // ApiOperation adds a readable summary for this endpoint in Swagger documentation.
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  /**
   * This method creates a brand-new user account.
   * It expects validated registration data and returns tokens plus the newly created user details.
   * It is important because it is the first step into the authenticated part of the system.
   * @Body() tells NestJS to read JSON from the request body and convert it into the RegisterDto shape.
   * The method is async because the service will do database work and token generation, both of which return Promises.
   */
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Pass the validated DTO into the service, because the service owns the real registration logic.
    return await this.authService.register(registerDto);
  }

  // Refresh access token
  // Post means this endpoint listens for HTTP POST requests at /auth/refresh.
  @Post('refresh')
  // Returning 200 here makes sense because we are not creating a new user record, only issuing fresh tokens.
  @HttpCode(HttpStatus.OK)
  // UseGuards runs RefreshTokenGuard first, so this method only runs when the refresh token is valid.
  @UseGuards(RefreshTokenGuard)
  // ApiBearerAuth tells Swagger that this endpoint expects a refresh bearer token.
  @ApiBearerAuth('JWT-refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  /**
   * This method creates fresh authentication tokens for an already authenticated user.
   * It expects trusted token-related user information and returns new token values.
   * It is important because access tokens are short-lived and need a safe renewal path.
   * @GetUser('id') reads the current user's id from req.user, which was attached earlier by the guard and strategy.
   */
  async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
    // The controller only forwards the trusted user id. The service decides how new tokens are generated and stored.
    return await this.authService.refreshTokens(userId);
  }

  // Logout user and invalidate refresh token
  // Post is used here because logging out changes server state.
  @Post('logout')
  // A successful logout returns 200 because the action completed and there is no new resource being created.
  @HttpCode(HttpStatus.OK)
  // JwtAuthGuard makes sure only logged-in users can log themselves out.
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the user and invalidates the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  /**
   * This method ends the current authenticated session on the server side.
   * It expects the current user identifier and returns either nothing or a simple success message.
   * It is important because it prevents old refresh tokens from being reused.
   * The controller awaits the service call first so the refresh token is cleared before the success message is returned.
   */
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    // This service call performs the async database update that removes the stored refresh token.
    await this.authService.logout(userId);
    // The controller returns a simple confirmation object so the client knows the action finished successfully.
    return { message: 'Successfully logged out' };
  }

  // Login
  // Post means the client sends credentials to /auth/login in the request body.
  @Post('login')
  // ApiOperation adds a beginner-friendly summary to the generated Swagger docs.
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  // Login returns 200 because the endpoint authenticates an existing user instead of creating a new one.
  @HttpCode(HttpStatus.OK)
  /**
   * This method checks user credentials and creates authentication tokens.
   * It expects login input and returns token data plus a safe version of the user record.
   * It is important because it starts the authenticated session for the API client.
   * @Body() reads the incoming email and password from the request body and gives them to the LoginDto.
   */
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // Delegate to the service so the controller stays focused on HTTP details instead of authentication rules.
    return await this.authService.login(loginDto);
  }
}
