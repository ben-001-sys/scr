/**
 * This is the root NestJS module for the API.
 * It gathers the feature modules, shared infrastructure, and global providers in one place so Nest can build the full application.
 * Every request eventually flows through the modules registered here.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import AppController from ./app.controller because this local file is part of the same feature or folder.
import { AppController } from './app.controller';
// Import AppService from ./app.service because this local file is part of the same feature or folder.
import { AppService } from './app.service';
// Import PrismaModule from ./prisma/prisma.module because this local file is part of the same feature or folder.
import { PrismaModule } from './prisma/prisma.module';
// Import AuthModule from ./modules/auth/auth.module because this local file is part of the same feature or folder.
import { AuthModule } from './modules/auth/auth.module';
// Import the configuration service so this file can read environment-based settings such as secrets and expiry times.
import { ConfigModule } from '@nestjs/config';
// Import UsersModule from ./modules/users/users.module because this local file is part of the same feature or folder.
import { UsersModule } from './modules/users/users.module';
// Import CategoryModule from ./modules/category/category.module because this local file is part of the same feature or folder.
import { CategoryModule } from './modules/category/category.module';
// Import ProductsModule from ./modules/products/products.module because this local file is part of the same feature or folder.
import { ProductsModule } from './modules/products/products.module';
// Import OrdersModule from ./modules/orders/orders.module because this local file is part of the same feature or folder.
import { OrdersModule } from './modules/orders/orders.module';
// Import rate-limiting tools that protect endpoints from being called too often.
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// Import PaymentsModule from ./modules/payments/payments.module because this local file is part of the same feature or folder.
import { PaymentsModule } from './modules/payments/payments.module';
// Import NestJS core utilities that help bootstrap the app or register framework-level providers.
import { APP_GUARD } from '@nestjs/core';
// Import CartModule from ./modules/cart/cart.module because this local file is part of the same feature or folder.
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60, // seconds
        limit: 10, // 10 requests per 60 seconds
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoryModule,
    CartModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
/**
 * The AppModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class AppModule {}
