/**
 * This service contains the business logic for the users feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the users controller and forms the main bridge between API requests and stored data.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Injectable, NotFoundException } from '@nestjs/common';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import UserResponseDto from ./dto/user-response.dto because this local file is part of the same feature or folder.
import { UserResponseDto } from './dto/user-response.dto';
// Import UpdateUserDto from ./dto/update-user.dto because this local file is part of the same feature or folder.
import { UpdateUserDto } from './dto/update-user.dto';
// Import ChangePasswordDto from ./dto/change-password.dto because this local file is part of the same feature or folder.
import { ChangePasswordDto } from './dto/change-password.dto';
// Import bcrypt so sensitive passwords or token-like values can be hashed or compared securely.
import * as bcrypt from 'bcrypt';

@Injectable()
/**
 * The UsersService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class UsersService {
  private readonly SALT_ROUNDS = 10;
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   */
  async findOne(userId: string): Promise<UserResponseDto> {
    // The service receives only the id here, then Prisma loads the matching user from the database.
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
        createdAt: true,
        updatedAt: true,
        // password is intentionally excluded so hashed passwords never leave the service by accident.
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Returning the selected user directly is safe because the query already removed sensitive fields.
    return user;
  }

  /**
   * This method loads a list of records, often with filtering and pagination support.
   * It expects query values and returns the matching data along with any extra metadata the controller needs.
   * It is important because list endpoints usually feed tables, dashboards, or index pages in the client.
   */
  async findAll(): Promise<UserResponseDto[]> {
    // Ask Prisma for a list of user records that match the given filters, pagination, and sorting rules.
    // This method is still async because the database query takes time and returns a Promise.
    return await this.prisma.user.findMany({
      // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // First load the existing user so later checks can compare old values with the requested new ones.
    // Ask Prisma for one user record using a unique field such as an id or email.
    const existingUser = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      // Email uniqueness is checked only when the email is actually being changed.
      // Ask Prisma for one user record using a unique field such as an id or email.
      const emailTaken = await this.prisma.user.findUnique({
        // where defines which database record or records Prisma should target.
        where: { email: updateUserDto.email },
      });
      if (emailTaken) {
        throw new NotFoundException('Email is already taken');
      }
    }

    // Update user profile
    // Ask Prisma to update an existing user record that matches the given where condition.
    const updatedUser = await this.prisma.user.update({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
      data: updateUserDto,
      // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    // The updated record is returned so the client can refresh its profile screen immediately.
    return updatedUser;
  }

  /**
   * This method changes the current user's password.
   * It expects the current user ID plus the old and new password values, and it returns a success message.
   * It is important because password changes must verify the current password before storing a new hash.
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Destructure the DTO once so the next password checks read more clearly.
    const { currentPassword, newPassword } = changePasswordDto;

    // Ask Prisma for one user record using a unique field such as an id or email.
    const user = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Compare the plain-text current password against the stored hash.
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Current password is incorrect');
    }

    // This second comparison prevents the user from changing the password to the same value again.
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new NotFoundException(
        'New password must be different from the current password',
      );
    }

    // Hash the new password before saving it so the database never stores the plain text version.
    const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Ask Prisma to update an existing user record that matches the given where condition.
    await this.prisma.user.update({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // A short success message is enough because the client does not need the whole user record again here.
    return { message: 'Password changed successfully' };
  }

  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async remove(userId: string): Promise<{ message: string }> {
    // Load the user first so the service can throw a clear error instead of deleting an unknown id silently.
    // Ask Prisma for one user record using a unique field such as an id or email.
    const user = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ask Prisma to permanently remove one user record from the database.
    await this.prisma.user.delete({
      // where defines which database record or records Prisma should target.
      where: { id: userId },
    });

    // Returning a message makes the delete result explicit even though there is no remaining user record to send back.
    return { message: 'User account deleted successfully' };
  }
}
