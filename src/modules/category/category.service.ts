/**
 * This service contains the business logic for the category feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the category controller and forms the main bridge between API requests and stored data.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import CreateCategoryDto from ./dto/create-category.dto because this local file is part of the same feature or folder.
import { CreateCategoryDto } from './dto/create-category.dto';
// Import CategoryResponseDto from ./dto/category-response.dto because this local file is part of the same feature or folder.
import { CategoryResponseDto } from './dto/category-response.dto';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Category, Prisma } from '@prisma/client';
// Import QueryCategoryDto from ./dto/query-category.dto because this local file is part of the same feature or folder.
import { QueryCategoryDto } from './dto/query-category.dto';
// Import UpdateCategoryDto from ./dto/update-category.dto because this local file is part of the same feature or folder.
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
/**
 * The CategoryService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class CategoryService {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private prisma: PrismaService) {}

  // Create a new category
  /**
   * This method creates a new record for this feature.
   * It expects validated input data and returns the newly created result in the response shape used by the API.
   * It is important because this is where incoming request data becomes stored application data.
   */
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { name, slug, ...rest } = createCategoryDto;

    const categorySlug =
      slug ??
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

    // Ask Prisma for one category record using a unique field such as an id or email.
    const existingCategory = await this.prisma.category.findUnique({
      // where defines which database record or records Prisma should target.
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      throw new Error(
        'Category with this slug already exists: ' + categorySlug,
      );
    }

    // Ask Prisma to create a new category record in the database using the data provided below.
    const category = await this.prisma.category.create({
      // data contains the values Prisma should write into the database.
      data: {
        name,
        slug: categorySlug,
        description: rest.description,
        imageUrl: rest.imageUrl ?? '',
        isActive: rest.isActive,
      },
    });

    return this.formatCategory(category, 0);
  }

  // Get all categories with optional filters and pagination
  /**
   * This method loads a list of records, often with filtering and pagination support.
   * It expects query values and returns the matching data along with any extra metadata the controller needs.
   * It is important because list endpoints usually feed tables, dashboards, or index pages in the client.
   */
  async findAll(queryDto: QueryCategoryDto): Promise<{
    data: CategoryResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { isActive, search, page = 1, limit = 10 } = queryDto;

    const where: Prisma.CategoryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        {
          name: { contains: search, mode: 'insensitive' },
        },
        {
          description: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    // Ask Prisma to count how many category records match the current filters so pagination metadata can be built.
    const total = await this.prisma.category.count({ where });

    // Ask Prisma for a list of category records that match the given filters, pagination, and sorting rules.
    const categories = await this.prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        _count: {
          // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
          select: { products: true },
        },
      },
    });

    return {
      data: categories.map((category) =>
        this.formatCategory(category, category._count.products),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get category by ID
  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   */
  async findOne(id: string): Promise<CategoryResponseDto> {
    // Ask Prisma for one category record using a unique field such as an id or email.
    const category = await this.prisma.category.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        _count: {
          // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  // Get category by slug
  /**
   * This method loads one record by its slug instead of its database ID.
   * It expects a slug string and returns the matching category data.
   * It is useful when the system wants friendly, readable URLs or lookup keys.
   */
  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    // Ask Prisma for one category record using a unique field such as an id or email.
    const category = await this.prisma.category.findUnique({
      // where defines which database record or records Prisma should target.
      where: { slug },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        _count: {
          // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  // Updatecategory
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Ask Prisma for one category record using a unique field such as an id or email.
    const existingCategory = await this.prisma.category.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (
      updateCategoryDto.slug &&
      updateCategoryDto.slug !== existingCategory.slug
    ) {
      // Ask Prisma for one category record using a unique field such as an id or email.
      const slugTaken = await this.prisma.category.findUnique({
        // where defines which database record or records Prisma should target.
        where: { slug: updateCategoryDto.slug },
      });

      if (slugTaken) {
        throw new ConflictException(
          `Category with slug ${updateCategoryDto.slug} already exists`,
        );
      }
    }

    // Ask Prisma to update an existing category record that matches the given where condition.
    const updatedCategory = await this.prisma.category.update({
      // where defines which database record or records Prisma should target.
      where: { id },
      data: updateCategoryDto,
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        _count: {
          // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
          select: { products: true },
        },
      },
    });

    return this.formatCategory(
      updatedCategory,
      /**
       * This method handles the Number step of this file.
       * It expects the values listed in its parameters and returns the result type shown in its signature.
       * It is important because it plays one focused part in the request or data flow for this feature.
       */
      Number(updatedCategory._count.products),
    );
  }

  // Remove a catgory
  /**
   * This method removes an existing record or relationship.
   * It expects the identifier of the target data and returns either the updated state or a success message.
   * It is important because destructive actions usually need validation before they reach the database.
   */
  async remove(id: string): Promise<{ message: string }> {
    // Ask Prisma for one category record using a unique field such as an id or email.
    const category = await this.prisma.category.findUnique({
      // where defines which database record or records Prisma should target.
      where: { id },
      // include tells Prisma to also load related records in the same query, such as a product's category or an order's items.
      include: {
        _count: {
          // select tells Prisma to return only the listed fields, which avoids exposing data the API does not need.
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category._count.products} products. Remove or reassign first`,
      );
    }

    // Ask Prisma to permanently remove one category record from the database.
    await this.prisma.category.delete({
      // where defines which database record or records Prisma should target.
      where: { id },
    });

    return { message: `Category delete successfully` };
  }

  /**
   * This helper reshapes raw data into the response format used by the API.
   * It expects a database result and returns a cleaner object that is easier for controllers and clients to work with.
   * It is important because it keeps response formatting consistent across the feature.
   */
  private formatCategory(
    category: Category,
    productCount: number,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
