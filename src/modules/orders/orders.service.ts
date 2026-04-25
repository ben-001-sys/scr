/**
 * This service contains the business logic for the orders feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the orders controller and forms the main bridge between API requests and stored data.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import CreateOrderDto from ./dto/create-order.dto because this local file is part of the same feature or folder.
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Order, OrderItem, OrderStatus, Product, User } from '@prisma/client';
// Import QueryOrderDto from ./dto/query-order.dto because this local file is part of the same feature or folder.
import { QueryOrderDto } from './dto/query-order.dto';
// Import UpdateOrderDto from ./dto/update-order.dto because this local file is part of the same feature or folder.
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
/**
 * The OrdersService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class OrdersService {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private prisma: PrismaService) {}

  // Create
  /**
   * This method creates a new record for this feature.
   * It expects validated input data and returns the newly created result in the response shape used by the API.
   * It is important because this is where incoming request data becomes stored application data.
   */
  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    // The DTO arrives from the controller already validated, so this method can focus on stock checks and database writes.
    const { items, shippingAddress } = createOrderDto;

    // Each item must be checked before the order is created, otherwise stock could go negative later.
    for (const item of items) {
      // Ask Prisma for one product record using a unique field such as an id or email.
      const product = await this.prisma.product.findUnique({
        // where defines which database record or records Prisma should target.
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (product.stock < item.quantity) {
        // The order is rejected early if any product does not have enough stock.
        throw new BadRequestException(
          `Insufficient stock for product  ${product.name}.  Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    // Calculate the final order total from all items before writing the order to the database.
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Ask Prisma for the first cart record that matches the filters. This is useful when the query is not based on one unique field.
    const latestCart = await this.prisma.cart.findFirst({
      // where defines which database record or records Prisma should target.
      where: {
        userId,
        checkedOut: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Run these database steps inside a single transaction so all changes succeed together or fail together.
    const order = await this.prisma.$transaction(async (tx) => {
      // The order and stock updates live in one transaction so they either all succeed or all fail together.
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount: total,
          shippingAddress,
          cartId: latestCart?.id,
          orderNumber: `ORD-${Date.now()}`,
          orderItems: {
            // Nested create lets Prisma create all order items at the same time as the order itself.
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
        include: {
          orderItems: {
            // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      for (const item of items) {
        // After the order is created, stock is decremented so inventory matches what was sold.
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return newOrder;
    });
    // wrap standardizes the service response so the controller gets a predictable API shape.
    return this.wrap(order);
  }

  // Get all orders for admin
  /**
   * This method loads a paginated list of records for administrators.
   * It expects query options such as page, limit, and optional filters, and it returns both data and pagination information.
   * It is important because admin endpoints usually need a wider view of the system than normal users.
   */
  async findAllForAdmin(query: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status, search } = query;
    // skip calculates how many rows should be ignored before the current page starts.
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search)
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search, mode: 'insensitive' } },
      ];

    const [orders, total] = await Promise.all([
      // findMany returns the current page of orders with related items and user information included.
      // Ask Prisma for a list of order records that match the given filters, pagination, and sorting rules.
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
        include: {
          orderItems: {
            // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Ask Prisma to count how many order records match the current filters so pagination metadata can be built.
      this.prisma.order.count({ where }),
    ]);

    return {
      // map converts each Prisma order record into the OrderResponseDto shape used by the API.
      data: orders.map((o) => this.map(o)),
      total,
      page,
      limit,
    };
  }

  // Get user current orders
  /**
   * This method loads a list of records, often with filtering and pagination support.
   * It expects query values and returns the matching data along with any extra metadata the controller needs.
   * It is important because list endpoints usually feed tables, dashboards, or index pages in the client.
   */
  async findAll(
    userId: string,
    query: QueryOrderDto,
  ): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    // This where object starts with userId so normal users only ever see their own orders.
    const where: any = { userId };
    if (status) where.status = status;
    if (search) where.OR = [{ id: { contains: search, mode: 'insensitive' } }];

    const [orders, total] = await Promise.all([
      // Ask Prisma for a list of order records that match the given filters, pagination, and sorting rules.
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
        include: {
          orderItems: {
            // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Ask Prisma to count how many order records match the current filters so pagination metadata can be built.
      this.prisma.order.count({ where }),
    ]);

    return {
      // map keeps the response shape consistent between admin and user order listing endpoints.
      data: orders.map((o) => this.map(o)),
      total,
      page,
      limit,
    };
  }

  // Find order by id
  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   */
  async findOne(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const where: any = { id };
    if (userId) where.userId = userId;

    // Ask Prisma for the first order record that matches the filters. This is useful when the query is not based on one unique field.
    const order = await this.prisma.order.findFirst({
      where,
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        orderItems: {
          // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      // Throwing here prevents the API from returning an empty success response for a missing order.
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.wrap(order);
  }

  // Update order by admin or user
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const where: any = { id };
    if (userId) where.userId = userId;

    // Ask Prisma for the first order record that matches the filters. This is useful when the query is not based on one unique field.
    const existing = await this.prisma.order.findFirst({
      where,
    });
    if (!existing) throw new NotFoundException(`Order ${id} not found`);

    // Ask Prisma to update an existing order record that matches the given where condition.
    const updated = await this.prisma.order.update({
      // where defines which database record or records Prisma should target.
      where: { id },
      data: updateOrderDto,
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        orderItems: {
          // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return this.wrap(updated);
  }

  // Cancel an order
  /**
   * This method cancels an existing record when the current rules allow it.
   * It expects the target identifier and may also use the current user to enforce ownership checks.
   * It is important because cancellation usually has side effects such as status changes or stock restoration.
   */
  async cancel(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const where: any = { id };
    if (userId) where.userId = userId;
    // Ask Prisma for the first order record that matches the filters. This is useful when the query is not based on one unique field.
    const order = await this.prisma.order.findFirst({
      where,
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        orderItems: true,
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      // Only pending orders can be cancelled because later statuses usually mean the order is already being processed.
      throw new BadRequestException('Only pending orders can be  cancelled');
    }

    // Run these database steps inside a single transaction so all changes succeed together or fail together.
    const cancelled = await this.prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        // Cancelling the order returns the reserved quantity back into stock.
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
        include: {
          orderItems: {
            // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
    });

    return this.wrap(cancelled);
  }

  /**
   * This helper reshapes raw data into the response format used by the API.
   * It expects a database result and returns a cleaner object that is easier for controllers and clients to work with.
   * It is important because it keeps response formatting consistent across the feature.
   */
  private wrap(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
  ): OrderApiResponseDto<OrderResponseDto> {
    return {
      success: true,
      message: 'Order retreived successfully',
      // map keeps the formatting logic in one helper so multiple service methods return the same output shape.
      data: this.map(order),
    };
  }

  /**
   * This helper reshapes raw data into the response format used by the API.
   * It expects a database result and returns a cleaner object that is easier for controllers and clients to work with.
   * It is important because it keeps response formatting consistent across the feature.
   */
  private map(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
  ): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: Number(order.totalAmount),
      shippingAddress: order.shippingAddress ?? '',
      // The nested orderItems are transformed into simpler API items that include useful product information.
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      ...(order.user && {
        // These extra user fields are added only when user data was included in the query.
        userEmail: order.user.email,
        userName:
          `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
      }),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
