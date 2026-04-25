/**
 * This DTO describes the data shape used by the orders feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { OrderStatus } from '@prisma/client';
// Import IsEnum, IsOptional, IsString from class-validator because it is needed in this file.
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * The UpdateOrderDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
