/**
 * This controller defines the HTTP endpoints for the cart feature.
 * It receives requests, reads route parameters or request bodies, and forwards the real work to the matching service.
 * It sits between incoming API calls and the cart service layer, often combining guards, decorators, and Swagger documentation.
 */
// Import NestJS route decorators and request helpers used to turn HTTP requests into method parameters.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
// Import Swagger decorators so the cart endpoints are clearly documented for learners and API consumers.
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
// Import CartService from ./cart.service because this local file is part of the same feature or folder.
import { CartService } from './cart.service';
// Import AddToCartDto from ./dto/add-to-cart.dto because this local file is part of the same feature or folder.
import { AddToCartDto } from './dto/add-to-cart.dto';
// Import UpdateCartItemDto from ./dto/update-cart-item.dto because this local file is part of the same feature or folder.
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
// Import CartResponseDto from ./dto/cart-response.dto because this local file is part of the same feature or folder.
import { CartResponseDto } from './dto/cart-response.dto';
// Import JwtAuthGuard from ../../common/guards/jwt-auth.guard because this local file is part of the same feature or folder.
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// Import MergeCartDto from ./dto/merge-cart.dto because this local file is part of the same feature or folder.
import { MergeCartDto } from './dto/merge-cart.dto';
// Import GetUser from src/common/decorators/get-user.decorator so this file can use another shared part of the application.
import { GetUser } from 'src/common/decorators/get-user.decorator';

/**
 * Cart Controller
 * Handles shopping cart endpoints
 * All endpoints require authentication
 */
// ApiTags groups cart endpoints together in Swagger.
@ApiTags('cart')
// Controller sets /cart as the route prefix for every endpoint in this class.
@Controller('cart')
// UseGuards protects every cart route so only authenticated users can manage a cart.
@UseGuards(JwtAuthGuard)
// ApiBearerAuth tells Swagger that these routes require an access token.
@ApiBearerAuth('JWT-auth')
/**
 * The CartController class handles HTTP requests for this feature.
 * Controllers translate web requests into service calls and return the result back to the client.
 * This controller is used by NestJS when a matching route is called.
 */
export class CartController {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current user's cart
   * GET /cart
   */
  // Get means this method handles HTTP GET requests to /cart.
  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({
    status: 200,
    description: 'User cart with items',
    type: CartResponseDto,
  })
  /**
   * This method handles the get Cart step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   * @GetUser('id') reads the authenticated user's id from req.user.
   */
  async getCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    // The service either returns the active cart or creates one if the user has not started shopping yet.
    return this.cartService.getOrCreateCart(userId);
  }

  /**
   * Add item to cart
   * POST /cart/items
   */
  // Post means this route creates or changes cart state by adding a new item.
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 400,
    description: 'Product unavailable or insufficient stock',
  })
  /**
   * This method adds a product to the user's active cart.
   * It expects the current user ID and the product-and-quantity input, and it returns the updated cart.
   * It is important because it connects product availability rules to the shopping flow.
   * @Body() reads the product id and quantity from the request body after DTO validation.
   */
  async addToCart(
    @GetUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    // The controller forwards both the current user and the requested cart change to the service layer.
    return this.cartService.addToCart(userId, addToCartDto);
  }

  /**
   * Update cart item quantity
   * PATCH /cart/items/:id
   */
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async updateCartItem(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(userId, id, updateCartItemDto);
  }

  /**
   * Remove item from cart
   * DELETE /cart/items/:id
   */
  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async removeFromCart(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(userId, id);
  }

  /**
   * Clear all items from cart
   * DELETE /cart
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared',
    type: CartResponseDto,
  })
  /**
   * This method removes all items from the user's current active cart.
   * It expects the current user ID and returns the now-empty cart state.
   * It is important because it resets the shopping flow without deleting the user account or products.
   */
  async clearCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.clearCart(userId);
  }

  /**
   * Merge guest cart with user cart
   * POST /cart/merge
   */
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart' })
  @ApiBody({ type: MergeCartDto })
  @ApiResponse({
    status: 200,
    description: 'Merged cart',
    type: CartResponseDto,
  })
  /**
   * This method combines a guest cart with the signed-in user's active cart.
   * It expects the current user ID and a list of guest cart items, and it returns the merged cart.
   * It is important because users often add items before signing in and still expect those choices to be kept.
   */
  async mergeCart(
    @GetUser('id') userId: string,
    @Body() mergeCartDto: MergeCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.mergeCart(userId, mergeCartDto.items);
  }
}
