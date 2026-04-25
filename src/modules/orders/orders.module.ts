/**
 * This module wires together the orders feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the orders parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import OrdersController from ./orders.controller because this local file is part of the same feature or folder.
import { OrdersController } from './orders.controller';
// Import OrdersService from ./orders.service because this local file is part of the same feature or folder.
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
})
/**
 * The OrdersModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class OrdersModule {}
