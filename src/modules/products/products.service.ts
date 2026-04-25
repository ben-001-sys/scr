/**
 * This service contains the business logic for the products feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the products controller and forms the main bridge between API requests and stored data.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import CreateProductDto from ./dto/create-product.dto because this local file is part of the same feature or folder.
import { CreateProductDto } from './dto/create-product.dto';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Category, Prisma, Product } from '@prisma/client';
// Import ProductResponseDto from ./dto/product-response.dto because this local file is part of the same feature or folder.
import { ProductResponseDto } from './dto/product-response.dto';
// Import QueryProductDto from ./dto/query-product.dto because this local file is part of the same feature or folder.
import { QueryProductDto } from './dto/query-product.dto';
// Import UpdateProductDto from ./dto/update-product.dto because this local file is part of the same feature or folder.
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
/**
 * The ProductsService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class ProductsService {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private prisma: PrismaService) {}

  // Create product
  /**
   * This method creates a new record for this feature.
   * It expects validated input data and returns the newly created result in the response shape used by the API.
   * It is important because this is where incoming request data becomes stored application data.
   */
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    // The controller already validated the DTO, so this service can now focus on business rules and database work.
    // Ask Prisma for one product record using a unique field such as an id or email.
    const existingSku = await this.prisma.product.findUnique({
      // where defines which database record or records Prisma should target.
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      // SKU must stay unique so one product is not confused with another in future lookups.
      throw new ConflictException(
        `Product with SKU ${createProductDto.sku} already exist`,
      );
    }

    // Ask Prisma to create a new product record in the database using the data provided below.
    const product = await this.prisma.product.create({
      // data contains the values Prisma should write into the database.
      data: {
        ...createProductDto,
        // Prisma.Decimal is used because prices should not rely on normal floating-point math.
        price: new Prisma.Decimal(createProductDto.price),
        // Default empty strings keep optional text fields predictable when the client does not send them.
        description: createProductDto.description ?? '',
        imageUrl: createProductDto.imageUrl ?? '',
      },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        category: true,
      },
    });

    // The raw Prisma result is converted into the API response shape before it leaves the service.
    return this.formatProduct(product);
  }

  // Get all product
  /**
   * This method loads a list of records, often with filtering and pagination support.
   * It expects query values and returns the matching data along with any extra metadata the controller needs.
   * It is important because list endpoints usually feed tables, dashboards, or index pages in the client.
   */
  async findAll(queryDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    // Destructuring makes the optional filter values easier to read in the rest of the method.
    const { category, isActive, search, page = 1, limit = 10 } = queryDto;

    // This object starts empty and is filled only with filters the client actually sent.
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.categoryId = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      // OR means either the name or the description can match the search text.
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Ask Prisma to count how many product records match the current filters so pagination metadata can be built.
    const total = await this.prisma.product.count({ where });

    // Ask Prisma for a list of product records that match the given filters, pagination, and sorting rules.
    const products = await this.prisma.product.findMany({
      where,
      // skip and take work together to implement pagination.
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        category: true,
      },
    });

    return {
      // Each product is formatted so Decimal values and related data become easier for API clients to consume.
      data: products.map((product) => this.formatProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get product by id
  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    // Ask Prisma for one product record using a unique field such as an id or email.
    const product = await this.prisma.product.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        category: true,
      },
    });
    if (!product) {
      // Throwing here stops the method immediately so later code never tries to format a missing record.
      throw new NotFoundException('Product not found');
    }

    // Formatting keeps the controller response consistent with other product endpoints.
    return this.formatProduct(product);
  }

  // Update product
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Ask Prisma for one product record using a unique field such as an id or email.
    const existingProduct = await this.prisma.product.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      // This extra check is needed only when the caller wants to change the SKU.
      // Ask Prisma for one product record using a unique field such as an id or email.
      const skuTaken = await this.prisma.product.findUnique({
        // where defines which database record or records Prisma should target.
        where: { sku: updateProductDto.sku },
      });

      if (skuTaken) {
        throw new ConflictException(
          `Product with SKU ${updateProductDto.sku} already exists`,
        );
      }
    }

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.price !== undefined) {
      // Convert the updated price too, because Prisma expects Decimal for this field.
      updateData.price = new Prisma.Decimal(updateProductDto.price);
    }

    // Ask Prisma to update an existing product record that matches the given where condition.
    const updatedProduct = await this.prisma.product.update({
      // where defines which database record or records Prisma should target.
      where: { id },
      data: updateData,
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        category: true,
      },
    });

    // Return the formatted result so the controller gets the final API-ready object.
    return this.formatProduct(updatedProduct);
  }

  // Update product stock
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    // Ask Prisma for one product record using a unique field such as an id or email.
    const product = await this.prisma.product.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      // Negative stock would mean the system is promising items it no longer has.
      throw new BadRequestException('Insufficient stock');
    }

    // Ask Prisma to update an existing product record that matches the given where condition.
    const updatedProduct = await this.prisma.product.update({
      // where defines which database record or records Prisma should target.
      where: { id },
      data: { stock: newStock },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        category: true,
      },
    });

    // Returning the updated product helps the client refresh the UI with the latest stock value.
    return this.formatProduct(updatedProduct);
  }

  // Remove a product
  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async remove(id: string): Promise<{ message: string }> {
    // Ask Prisma for one product record using a unique field such as an id or email.
    const product = await this.prisma.product.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        orderItems: true,
        cartItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.orderItems.length > 0) {
      // Products already used in orders should not be deleted, because old orders still need those references.
      throw new BadRequestException(
        'Cannot delete product that is part of existing orders. Consider marking it as inactive only',
      );
    }

    // Ask Prisma to permanently remove one product record from the database.
    await this.prisma.product.delete({
      // where defines which database record or records Prisma should target.
      where: { id },
    });

    // A simple message is enough here because the deleted product record no longer exists to return.
    return { message: 'Product deleted successfully' };
  }

  /**
   * This helper reshapes raw data into the response format used by the API.
   * It expects a database result and returns a cleaner object that is easier for controllers and clients to work with.
   * It is important because it keeps response formatting consistent across the feature.
   */
  private formatProduct(
    product: Product & { category: Category },
  ): ProductResponseDto {
    return {
      ...product,
      // Prisma returns Decimal for price, but API clients usually expect a normal JavaScript number.
      price: Number(product.price),
      // Flattening category.name into category makes the response easier for beginners and frontend code to read.
      category: product.category.name,
    };
  }
}
