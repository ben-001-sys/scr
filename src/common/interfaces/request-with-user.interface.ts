/**
 * This interface describes the shape of a value used across the application.
 * Interfaces do not create runtime behavior, but they help TypeScript explain what properties should exist.
 * It improves clarity when different modules exchange the same kind of object.
 */
// Import Express request types so TypeScript knows what data exists on the incoming HTTP request.
import { Request } from 'express';

/**
 * The RequestWithUser interface describes a TypeScript-only shape used in this project.
 * It exists to make request data safer and clearer while coding.
 * It helps other files know what fields should be available.
 */
export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
