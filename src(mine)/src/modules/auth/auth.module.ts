import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategy/refrsh.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'defaultsecret2026',
        signOptions: {
          expiresIn: Number(configService.get<number>('JWT_EXPIRES_IN', 900)),
        },
      }),
    }),
    PrismaModule,
  ],
  providers: [
    AuthService,
    JwtService,
    ConfigService,
    PrismaService,
    RefreshTokenStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
