/**
 * This DTO describes the data shape used by the payments feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// Import IsNotEmpty, IsString from class-validator because it is needed in this file.
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * The ConfirmPaymentDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class ConfirmPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
