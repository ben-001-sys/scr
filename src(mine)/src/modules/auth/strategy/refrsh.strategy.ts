import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configservice: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configservice.get<string>('JWT_REFRESH_SECRET'),
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const AuthHeader = req.headers.authorization;
    if (!AuthHeader) {
      console.log('No authorization header found');
    }

    const refreshToken = AuthHeader?.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException('Error');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Error');
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
