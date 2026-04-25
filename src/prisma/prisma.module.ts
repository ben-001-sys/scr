/**
 * This module makes PrismaService available across the whole application.
 * Because it is marked as global, feature modules can inject PrismaService without importing the PrismaModule again and again.
 * It acts as the shared database layer that powers the rest of the system.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Global, Module } from '@nestjs/common';
// Import PrismaService from ./prisma.service because this local file is part of the same feature or folder.
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
/**
 * The PrismaModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class PrismaModule {}
