/**
 * This DTO describes the data shape used by the cart feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// Import Swagger decorators and builders so this API can describe itself in the generated docs.
import { ApiProperty } from '@nestjs/swagger';
// Import IsString, IsNotEmpty, IsNumber, Min from class-validator because it is needed in this file.
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
// Import Type from class-transformer because it is needed in this file.
import { Type } from 'class-transformer';

/**
 * DTO for adding items to cart
 */
/**
 * The AddToCartDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity of product',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
