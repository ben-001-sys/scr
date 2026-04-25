/**
 * This file defines a reusable custom decorator.
 * Custom decorators help controllers and guards share request-related behavior in a simple and readable way.
 * It supports other parts of the system by keeping repeated logic in one place.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { SetMetadata } from '@nestjs/common';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Role } from '@prisma/client';

/**
 * The ROLES_KEY helper is a custom decorator factory.
 * It returns a decorator that controllers or guards can attach to routes or parameters.
 * This keeps repeated request-related behavior readable and reusable.
 */
export const ROLES_KEY = 'roles';
/**
 * The Roles helper is a custom decorator factory.
 * It returns a decorator that controllers or guards can attach to routes or parameters.
 * This keeps repeated request-related behavior readable and reusable.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
