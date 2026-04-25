/**
 * This module wires together the auth feature.
 * In NestJS, a module tells the framework which controllers and providers belong together.
 * It helps the auth parts connect cleanly to the rest of the application.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Module } from '@nestjs/common';
// Import AuthService from ./auth.service because this local file is part of the same feature or folder.
import { AuthService } from './auth.service';
// Import AuthController from ./auth.controller because this local file is part of the same feature or folder.
import { AuthController } from './auth.controller';
// Import Passport integration so NestJS guards and strategies can handle authentication.
import { PassportModule } from '@nestjs/passport';
// Import JWT helpers used to create or validate JSON Web Tokens in the auth flow.
import { JwtModule } from '@nestjs/jwt';
// Import the configuration service so this file can read environment-based settings such as secrets and expiry times.
import { ConfigService } from '@nestjs/config';
// Import JwtStrategy from ./strategies/jwt.strategy because this local file is part of the same feature or folder.
import { JwtStrategy } from './strategies/jwt.strategy';
// Import RefreshTokenStrategy from ./strategies/refresh-token.strategy because this local file is part of the same feature or folder.
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

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
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
/**
 * The AuthModule class is a NestJS module definition.
 * It tells Nest which controllers and providers belong to this feature.
 * Nest reads this metadata at startup to connect the application correctly.
 */
export class AuthModule {}
