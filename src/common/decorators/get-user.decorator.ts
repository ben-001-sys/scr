/**
 * This file defines a reusable custom decorator.
 * Custom decorators help controllers and guards share request-related behavior in a simple and readable way.
 * It supports other parts of the system by keeping repeated logic in one place.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Custom decorator to extract user from request
/**
 * The GetUser helper is a custom decorator factory.
 * It returns a decorator that controllers or guards can attach to routes or parameters.
 * This keeps repeated request-related behavior readable and reusable.
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
