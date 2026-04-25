/**
 * This guard runs before a controller handler is allowed to execute.
 * Guards are used to protect routes by checking things like authentication or authorization rules.
 * It plugs into the request pipeline so protected endpoints can reject invalid users early.
 */
// Role guard

// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// Import NestJS core utilities that help bootstrap the app or register framework-level providers.
import { Reflector } from '@nestjs/core';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Role } from '@prisma/client';
// Import ROLES_KEY from ../decorators/roles.decorator because this local file is part of the same feature or folder.
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
/**
 * The RolesGuard class decides whether a request is allowed to continue.
 * It exists to enforce rules before the controller method runs.
 * Controllers attach this guard when a route needs protection.
 */
export class RolesGuard implements CanActivate {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private reflector: Reflector) {}

  /**
   * This method handles the can Activate step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requireRoles.some((role) => user.role === role);
  }
}
