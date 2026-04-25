/**
 * This controller defines the HTTP endpoints for the users feature.
 * It receives requests, reads route parameters or request bodies, and forwards the real work to the matching service.
 * It sits between incoming API calls and the users service layer, often combining guards, decorators, and Swagger documentation.
 */
// Import NestJS decorators and helpers used to define routes and read values from the incoming request.
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// Import JwtAuthGuard from src/common/guards/jwt-auth.guard so this file can use another shared part of the application.
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// Import RolesGuard from src/common/guards/roles.guard so this file can use another shared part of the application.
import { RolesGuard } from 'src/common/guards/roles.guard';
// Import UsersService from ./users.service because this local file is part of the same feature or folder.
import { UsersService } from './users.service';
// Import UserResponseDto from ./dto/user-response.dto because this local file is part of the same feature or folder.
import { UserResponseDto } from './dto/user-response.dto';
// Import RequestWithUser from src/common/interfaces/request-with-user.interface so this file can use another shared part of the application.
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
// Import Roles from src/common/decorators/roles.decorator so this file can use another shared part of the application.
import { Roles } from 'src/common/decorators/roles.decorator';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Role } from '@prisma/client';
// Import UpdateUserDto from ./dto/update-user.dto because this local file is part of the same feature or folder.
import { UpdateUserDto } from './dto/update-user.dto';
// Import GetUser from src/common/decorators/get-user.decorator so this file can use another shared part of the application.
import { GetUser } from 'src/common/decorators/get-user.decorator';
// Import ChangePasswordDto from ./dto/change-password.dto because this local file is part of the same feature or folder.
import { ChangePasswordDto } from './dto/change-password.dto';

// ApiTags groups all user routes together in Swagger.
@ApiTags('users')
// ApiBearerAuth tells Swagger that these routes require an access token.
@ApiBearerAuth('JWT-auth')
// UseGuards means every method in this controller is protected by authentication and role checks.
@UseGuards(JwtAuthGuard, RolesGuard)
// Controller sets the route prefix, so these endpoints start with /users.
@Controller('users')
/**
 * The UsersController class handles HTTP requests for this feature.
 * Controllers translate web requests into service calls and return the result back to the client.
 * This controller is used by NestJS when a matching route is called.
 */
export class UsersController {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private readonly usersService: UsersService) {}

  //   Get current user profile
  // Get means this method handles HTTP GET requests for /users/me.
  @Get('me')
  // ApiOperation adds a summary to Swagger so readers know this endpoint returns the current user's profile.
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'The current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  /**
   * This controller method returns the profile of the currently authenticated user.
   * It expects the authenticated request information and returns a safe user response.
   * It is important because many account screens need the current user's own data.
   * @Req() gives access to the full request object, including req.user, which was attached earlier by the auth guard.
   */
  async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    // Forward only the authenticated user's id to the service. The service then reads the matching database record.
    return await this.usersService.findOne(req.user.id);
  }

  // Get all users (for admin purposes)
  // Get with no extra path means this endpoint responds to /users.
  @Get()
  // Roles(Role.ADMIN) marks this route as admin-only, and RolesGuard reads that metadata later.
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  /**
   * This method loads a list of records, often with filtering and pagination support.
   * It expects query values and returns the matching data along with any extra metadata the controller needs.
   * It is important because list endpoints usually feed tables, dashboards, or index pages in the client.
   */
  async findAll(): Promise<UserResponseDto[]> {
    // The controller has no extra business logic here. It simply asks the service for all user records.
    return await this.usersService.findAll();
  }

  // Get user by ID (for admin purposes)
  // Get(':id') means NestJS should read the dynamic value from the URL, such as /users/123.
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified ID',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   * @Param('id') reads the id directly from the route path.
   */
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    // Pass the route id to the service so it can query Prisma for exactly one user.
    return await this.usersService.findOne(id);
  }

  // Update current user profile
  // Patch means this endpoint updates part of an existing resource instead of replacing the whole record.
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'The updated user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   * @GetUser('id') reads the authenticated user's id, while @Body() reads the new profile values from the request body.
   */
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // The service receives both the user id and the validated DTO so it can update the correct database record.
    return await this.usersService.update(userId, updateUserDto);
  }

  // Change curren tuser password
  // Patch is used again because this changes only one part of the user account: the password.
  @Patch('me/password')
  // HttpCode makes the success status explicit for readers and API clients.
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  /**
   * This method changes the current user's password.
   * It expects the current user ID plus the old and new password values, and it returns a success message.
   * It is important because password changes must verify the current password before storing a new hash.
   */
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // The service performs the secure password checks and hashing work, so the controller stays simple.
    return await this.usersService.changePassword(userId, changePasswordDto);
  }

  // Delete current user account
  // Delete means this route removes data when the request is accepted.
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async deleteAccount(
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    // Only the authenticated user's id is needed here, because the service will delete that matching account.
    return await this.usersService.remove(userId);
  }

  // Delete user by ID (for admin purposes)
  // Delete(':id') lets an admin remove another user's account by URL id.
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User with the specified ID deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    // The controller forwards the id to the service, which performs the actual existence check and deletion.
    return await this.usersService.remove(id);
  }
}
