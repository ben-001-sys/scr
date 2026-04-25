/**
 * This DTO describes the data shape used by the cart feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// Import Swagger decorators and builders so this API can describe itself in the generated docs.
import { ApiProperty } from '@nestjs/swagger';
// Import CartItemResponseDto from ./cart-item-response.dto because this local file is part of the same feature or folder.
import { CartItemResponseDto } from './cart-item-response.dto';

/**
 * DTO for cart response
 */
/**
 * The CartResponseDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class CartResponseDto {
  @ApiProperty({
    description: 'Cart ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'Cart items',
    type: [CartItemResponseDto],
  })
  cartItems: CartItemResponseDto[];

  @ApiProperty({
    description: 'Total cart value',
    example: 299.97,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Total items count',
    example: 3,
  })
  totalItems: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
