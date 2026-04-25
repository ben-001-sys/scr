/**
 * This module wires together the cart feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the cart parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import CartController from ./cart.controller because this local file is part of the same feature or folder.
import { CartController } from './cart.controller';
// Import CartService from ./cart.service because this local file is part of the same feature or folder.
import { CartService } from './cart.service';
// Import PrismaModule from ../../prisma/prisma.module because this local file is part of the same feature or folder.
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Cart Module
 * Handles shopping cart and cart items management
 */
@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
/**
 * The CartModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class CartModule {}
