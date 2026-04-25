/**
 * This module wires together the users feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the users parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import UsersController from ./users.controller because this local file is part of the same feature or folder.
import { UsersController } from './users.controller';
// Import UsersService from ./users.service because this local file is part of the same feature or folder.
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
/**
 * The UsersModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class UsersModule {}
