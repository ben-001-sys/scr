/**
 * This module wires together the payments feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the payments parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import PaymentsController from ./payments.controller because this local file is part of the same feature or folder.
import { PaymentsController } from './payments.controller';
// Import PaymentsService from ./payments.service because this local file is part of the same feature or folder.
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
/**
 * The PaymentsModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class PaymentsModule {}
