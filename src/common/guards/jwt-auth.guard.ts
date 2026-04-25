/**
 * This guard runs before a controller handler is allowed to execute.
 * Guards are used to protect routes by checking things like authentication or authorization rules.
 * It plugs into the request pipeline so protected endpoints can reject invalid users early.
 */
// Jwt auth guard

// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { ExecutionContext, Injectable } from '@nestjs/common';
// Import NestJS core utilities that help bootstrap the app or register framework-level providers.
import { Reflector } from '@nestjs/core';
// Import Passport integration so NestJS guards and strategies can handle authentication.
import { AuthGuard } from '@nestjs/passport';

@Injectable()
/**
 * The JwtAuthGuard class decides whether a request is allowed to continue.
 * It exists to enforce rules before the controller method runs.
 * Controllers attach this guard when a route needs protection.
 */
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private reflector: Reflector) {
    /**
     * This method handles the super step of this file.
     * It expects the values listed in its parameters and returns the result type shown in its signature.
     * It is important because it plays one focused part in the request or data flow for this feature.
     */
    super();
  }

  /**
   * This method handles the can Activate step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
