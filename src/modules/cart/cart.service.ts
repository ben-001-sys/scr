/**
 * This service contains the business logic for the cart feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the cart controller and forms the main bridge between API requests and stored data.
 */
// Import NestJS exceptions used when cart actions fail validation or try to use missing data.
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// Import PrismaService from ../../prisma/prisma.service because this local file is part of the same feature or folder.
import { PrismaService } from '../../prisma/prisma.service';
// Import AddToCartDto from ./dto/add-to-cart.dto because this local file is part of the same feature or folder.
import { AddToCartDto } from './dto/add-to-cart.dto';
// Import UpdateCartItemDto from ./dto/update-cart-item.dto because this local file is part of the same feature or folder.
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
// Import CartResponseDto from ./dto/cart-response.dto because this local file is part of the same feature or folder.
import { CartResponseDto } from './dto/cart-response.dto';
// Import CartItemResponseDto from ./dto/cart-item-response.dto because this local file is part of the same feature or folder.
import { CartItemResponseDto } from './dto/cart-item-response.dto';

@Injectable()
/**
 * The CartService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class CartService {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create active cart
   */
  /**
   * This method returns an existing record when it already exists, or creates one when it does not.
   * It expects the values needed to identify the record and returns a ready-to-use result.
   * It is important because it gives callers one simple entry point for both cases.
   */
  async getOrCreateCart(userId: string): Promise<CartResponseDto> {
    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Add item to cart
   */
  /**
   * This method adds a product to the user's active cart.
   * It expects the current user ID and the product-and-quantity input, and it returns the updated cart.
   * It is important because it connects product availability rules to the shopping flow.
   */
  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    // Destructure once so the later stock and cart checks can use short variable names.
    const { productId, quantity } = addToCartDto;

    // Ask Prisma for one product record using a unique field such as an id or email.
    const product = await this.prisma.product.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (!product.isActive)
      // Inactive products should not be added because they are hidden or unavailable for sale.
      throw new BadRequestException('Product is not available');
    if (product.stock < quantity)
      // Stock is checked before touching the cart so users cannot add more items than exist.
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}`,
      );

    // Get the current active cart or create one so the rest of the logic always has a cart to work with.
    const cart = await this.getOrCreateActiveCart(userId);

    // Ask Prisma for the first cart Item record that matches the filters. This is useful when the query is not based on one unique field.
    const existingItem = await this.prisma.cartItem.findFirst({
      // where defines which database record or records Prisma should target.
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      // If the item is already in the cart, update its quantity instead of creating a duplicate row.
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Current in cart: ${existingItem.quantity}`,
        );
      }

      // Ask Prisma to update an existing cart Item record that matches the given where condition.
      await this.prisma.cartItem.update({
        // where defines which database record or records Prisma should target.
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Ask Prisma to create a new cart Item record in the database using the data provided below.
      // This branch runs only when the product is not already present in the cart.
      await this.prisma.cartItem.create({
        // data contains the values Prisma should write into the database.
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return the refreshed cart so the client immediately sees the latest totals and item list.
    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Update cart item quantity
   */
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const { quantity } = updateCartItemDto;

    // Ask Prisma for one cart Item record using a unique field such as an id or email.
    const cartItem = await this.prisma.cartItem.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: cartItemId },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId)
      // This ownership check stops one user from editing another user's cart item.
      throw new NotFoundException('Cart item not found');

    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.product.stock}`,
      );
    }

    // Ask Prisma to update an existing cart Item record that matches the given where condition.
    await this.prisma.cartItem.update({
      // where defines which database record or records Prisma should target.
      where: { id: cartItemId },
      data: { quantity },
    });

    // Returning the rebuilt cart keeps the response consistent with the other cart endpoints.
    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Remove item
   */
  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async removeFromCart(
    userId: string,
    cartItemId: string,
  ): Promise<CartResponseDto> {
    // Ask Prisma for one cart Item record using a unique field such as an id or email.
    const cartItem = await this.prisma.cartItem.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id: cartItemId },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId)
      throw new NotFoundException('Cart item not found');

    // Ask Prisma to permanently remove one cart Item record from the database.
    await this.prisma.cartItem.delete({
      // where defines which database record or records Prisma should target.
      where: { id: cartItemId },
    });

    // After deleting the row, return the current cart state so the UI can refresh itself.
    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Clear cart
   */
  /**
   * This method removes all items from the user's current active cart.
   * It expects the current user ID and returns the now-empty cart state.
   * It is important because it resets the shopping flow without deleting the user account or products.
   */
  async clearCart(userId: string): Promise<CartResponseDto> {
    // Ask Prisma for the first cart record that matches the filters. This is useful when the query is not based on one unique field.
    const cart = await this.prisma.cart.findFirst({
      // where defines which database record or records Prisma should target.
      where: { userId, checkedOut: false },
    });

    if (cart) {
      // Ask Prisma to remove multiple cart Item records that match the given filter.
      // deleteMany is used here because a cart can contain many item rows.
      await this.prisma.cartItem.deleteMany({
        // where defines which database record or records Prisma should target.
        where: { cartId: cart.id },
      });
    }

    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Merge guest cart into active cart
   */
  /**
   * This method combines a guest cart with the signed-in user's active cart.
   * It expects the current user ID and a list of guest cart items, and it returns the merged cart.
   * It is important because users often add items before signing in and still expect those choices to be kept.
   */
  async mergeCart(
    userId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<CartResponseDto> {
    if (!items || items.length === 0) {
      // If there is nothing to merge, the safest result is just the current active cart.
      return this.getOrCreateActiveCart(userId);
    }

    for (const item of items) {
      try {
        // Reusing addToCart keeps all stock and availability checks in one shared place.
        await this.addToCart(userId, {
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (err) {
        console.warn(
          `[CartService] Failed to merge item ${item.productId}:`,
          err.message,
        );
      }
    }

    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Format cart
   */
  /**
   * This helper reshapes raw data into the response format used by the API.
   * It expects a database result and returns a cleaner object that is easier for controllers and clients to work with.
   * It is important because it keeps response formatting consistent across the feature.
   */
  private formatCart(cart: any): CartResponseDto {
    // Each raw cart item is reshaped so the API response contains normal numbers and a predictable structure.
    const cartItems: CartItemResponseDto[] = cart.cartItems.map(
      (item: any) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
    );

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      cartItems,
      totalPrice,
      totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Get or create active (non-checked-out) cart
   */
  /**
   * This method returns an existing record when it already exists, or creates one when it does not.
   * It expects the values needed to identify the record and returns a ready-to-use result.
   * It is important because it gives callers one simple entry point for both cases.
   */
  async getOrCreateActiveCart(userId: string) {
    // Ask Prisma for the first cart record that matches the filters. This is useful when the query is not based on one unique field.
    let cart = await this.prisma.cart.findFirst({
      // where defines which database record or records Prisma should target.
      where: { userId, checkedOut: false },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        cartItems: { include: { product: true } },
      },
    });

    if (!cart) {
      // Ask Prisma to create a new cart record in the database using the data provided below.
      cart = await this.prisma.cart.create({
        // data contains the values Prisma should write into the database.
        data: { userId },
        // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
        include: {
          cartItems: { include: { product: true } },
        },
      });
    }

    return this.formatCart(cart);
  }
}
