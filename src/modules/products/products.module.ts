/**
 * This module wires together the products feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the products parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import ProductsController from ./products.controller because this local file is part of the same feature or folder.
import { ProductsController } from './products.controller';
// Import ProductsService from ./products.service because this local file is part of the same feature or folder.
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
/**
 * The ProductsModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class ProductsModule {}
