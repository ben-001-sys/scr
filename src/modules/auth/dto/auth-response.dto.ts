/**
 * This DTO describes the data shape used by the auth feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// DTO for auth response

// Import Swagger decorators and builders so this API can describe itself in the generated docs.
import { ApiProperty } from '@nestjs/swagger';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Role } from '@prisma/client';

/**
 * The AuthResponseDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example:
      'dGhpcy1pcz1hLXJlZnJlc2gtdG9rZW4tZXhhbXBsZS13aXRoLXN1ZmZpY2lhbC1jaGFyYWN0ZXJzIQ==',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user information',
    example: {
      id: 'user-123',
      email: '<EMAIL>',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
}
