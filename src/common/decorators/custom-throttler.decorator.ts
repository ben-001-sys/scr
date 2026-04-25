/**
 * This file defines a reusable custom decorator.
 * Custom decorators help controllers and guards share request-related behavior in a simple and readable way.
 * It supports other parts of the system by keeping repeated logic in one place.
 */
// Custom throttl config

// Import rate-limiting tools that protect endpoints from being called too often.
import { Throttle } from '@nestjs/throttler';

// Strict rate for auth, payments
/**
 * The StrictThrottle helper is a custom decorator factory.
 * It returns a decorator that controllers or guards can attach to routes or parameters.
 * This keeps repeated request-related behavior readable and reusable.
 */
export const StrictThrottle = () =>
  /**
   * This method handles the Throttle step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  Throttle({
    default: {
      ttl: 1000,
      limit: 3,
    },
  });

// Moderate rate for orders
/**
 * The ModerateThrottle helper is a custom decorator factory.
 * It returns a decorator that controllers or guards can attach to routes or parameters.
 * This keeps repeated request-related behavior readable and reusable.
 */
export const ModerateThrottle = () =>
  /**
   * This method handles the Throttle step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });

// Relaxed rate for read operations
/**
 * The RelaxedThrottle helper is a custom decorator factory.
 * It returns a decorator that controllers or guards can attach to routes or parameters.
 * This keeps repeated request-related behavior readable and reusable.
 */
export const RelaxedThrottle = () =>
  /**
   * This method handles the Throttle step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  Throttle({
    default: {
      ttl: 1000,
      limit: 20,
    },
  });
