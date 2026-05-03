import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './modules/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { ProductService } from './modules/product/product.service';
import { ProductController } from './modules/product/product.controller';
import { ProductModule } from './modules/product/product.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    JwtModule,
    UserModule,
    ProductModule,
  ],
  controllers: [AppController, AuthController, ProductController],
  providers: [AppService, PrismaService, AuthService, ProductService],
})
export class AppModule {}
