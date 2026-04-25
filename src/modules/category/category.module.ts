/**
 * This module wires together the category feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the category parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import CategoryController from ./category.controller because this local file is part of the same feature or folder.
import { CategoryController } from './category.controller';
// Import CategoryService from ./category.service because this local file is part of the same feature or folder.
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
/**
 * The CategoryModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class CategoryModule {}
