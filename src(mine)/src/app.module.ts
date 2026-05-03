import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersService } from './modules/users/users.service';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductService } from './modules/product/product.service';
import { ProductModule } from './modules/product/product.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './modules/prisma/prisma.service';
import { AuthService } from './modules/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    UsersModule,
    PrismaModule,
    ProductModule,
    JwtModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    UsersService,
    ProductService,
    PrismaService,
    AuthService,
  ],
})
export class AppModule {}
