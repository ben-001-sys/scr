/**
 * This guard runs before a controller handler is allowed to execute.
 * Guards are used to protect routes by checking things like authentication or authorization rules.
 * It plugs into the request pipeline so protected endpoints can reject invalid users early.
 */
// Guard for protecting refresh token endpoints

// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Injectable } from '@nestjs/common';
// Import Passport integration so NestJS guards and strategies can handle authentication.
import { AuthGuard } from '@nestjs/passport';

@Injectable()
/**
 * The RefreshTokenGuard class decides whether a request is allowed to continue.
 * It exists to enforce rules before the controller method runs.
 * Controllers attach this guard when a route needs protection.
 */
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
