import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokenStratgey } from './strategy/refresh-token.strategy';
import { JwtStratgey } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'defaultsecret2025',
        signOptions: {
          expiresIn: Number(configService.get<number>('JWT_EXPIRES_IN', 900)),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    ConfigService,
    JwtService,
    RefreshTokenStratgey,
    JwtStratgey,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
