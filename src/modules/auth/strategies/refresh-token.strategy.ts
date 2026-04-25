/**
 * This file defines a Passport authentication strategy used by NestJS guards.
 * A strategy explains how a token should be read and how the application should turn that token into a trusted user object.
 * It connects the auth module, JWT configuration, and protected routes.
 */
// Refresh Token Strategy

// Import the configuration service so this file can read environment-based settings such as secrets and expiry times.
import { ConfigService } from '@nestjs/config';
// Import Passport integration so NestJS guards and strategies can handle authentication.
import { PassportStrategy } from '@nestjs/passport';
// Import Passport's JWT strategy pieces so tokens can be extracted from headers and validated.
import { Strategy, ExtractJwt } from 'passport-jwt';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import Express request types so TypeScript knows what data exists on the incoming HTTP request.
import { Request } from 'express';
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Injectable, UnauthorizedException } from '@nestjs/common';
// Import bcrypt so sensitive passwords or token-like values can be hashed or compared securely.
import * as bcrypt from 'bcrypt';

@Injectable()
/**
 * The RefreshTokenStrategy class teaches Passport and NestJS how to validate this kind of token.
 * It exists so protected routes can turn a raw JWT into a trusted user object.
 * Guards use this strategy behind the scenes during authentication.
 */
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    /**
     * This method handles the super step of this file.
     * It expects the values listed in its parameters and returns the result type shown in its signature.
     * It is important because it plays one focused part in the request or data flow for this feature.
     */
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  // validate refresh token
  /**
   * This method checks incoming authentication data and returns the user information that should be attached to the request.
   * It expects token-related input from Passport and returns a trusted user object when validation succeeds.
   * It is important because guards depend on it before protected controller methods can run.
   */
  async validate(req: Request, payload: { sub: string; email: string }) {
    console.log('RefreshTokenStrategy.validate called');
    console.log('Payload', { sub: payload.sub, email: payload.email });

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header found');
      throw new UnauthorizedException('Refresh token not provided');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is empty after extraction',
      );
    }

    // Ask Prisma for one user record using a unique field such as an id or email.
    const user = await this.prisma.user.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: payload.sub },
      // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
      select: {
        id: true,
        email: true,
        role: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh does not match');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
