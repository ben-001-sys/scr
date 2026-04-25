/**
 * This controller defines the HTTP endpoints for the orders feature.
 * It receives requests, reads route parameters or request bodies, and forwards the real work to the matching service.
 * It sits between incoming API calls and the orders service layer, often combining guards, decorators, and Swagger documentation.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
// Import JwtAuthGuard from src/common/guards/jwt-auth.guard so this file can use another shared part of the application.
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// Import RolesGuard from src/common/guards/roles.guard so this file can use another shared part of the application.
import { RolesGuard } from 'src/common/guards/roles.guard';
// Import OrdersService from ./orders.service because this local file is part of the same feature or folder.
import { OrdersService } from './orders.service';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from 'src/common/decorators/custom-throttler.decorator';
// Import CreateOrderDto from ./dto/create-order.dto because this local file is part of the same feature or folder.
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
} from './dto/order-response.dto';
// Import GetUser from src/common/decorators/get-user.decorator so this file can use another shared part of the application.
import { GetUser } from 'src/common/decorators/get-user.decorator';
// Import Roles from src/common/decorators/roles.decorator so this file can use another shared part of the application.
import { Roles } from 'src/common/decorators/roles.decorator';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { Role } from '@prisma/client';
// Import QueryOrderDto from ./dto/query-order.dto because this local file is part of the same feature or folder.
import { QueryOrderDto } from './dto/query-order.dto';
// Import UpdateOrderDto from ./dto/update-order.dto because this local file is part of the same feature or folder.
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
/**
 * The OrdersController class handles HTTP requests for this feature.
 * Controllers translate web requests into service calls and return the result back to the client.
 * This controller is used by NestJS when a matching route is called.
 */
export class OrdersController {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private readonly ordersService: OrdersService) {}

  // Create orders
  @Post()
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Create a new order',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or insufficient stock',
  })
  @ApiNotFoundResponse({
    description: 'Cart not found or empty',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  /**
   * This method creates a new record for this feature.
   * It expects validated input data and returns the newly created result in the response shape used by the API.
   * It is important because this is where incoming request data becomes stored application data.
   */
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.ordersService.create(userId, createOrderDto);
  }

  // Get all orders
  @Get('admin/all')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN] Get all orders (paginated)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    description: 'List of orders',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(OrderResponseDto) },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  /**
   * This method loads a paginated list of records for administrators.
   * It expects query options such as page, limit, and optional filters, and it returns both data and pagination information.
   * It is important because admin endpoints usually need a wider view of the system than normal users.
   */
  async findAllForAdmin(@Query() query: QueryOrderDto) {
    return await this.ordersService.findAllForAdmin(query);
  }

  // User Get own orders
  @Get()
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get all orders for current user (paginated)',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'List of user orders',
    type: PaginatedOrderResponseDto,
  })
  /**
   * This method loads a list of records, often with filtering and pagination support.
   * It expects query values and returns the matching data along with any extra metadata the controller needs.
   * It is important because list endpoints usually feed tables, dashboards, or index pages in the client.
   */
  async findAll(@Query() query: QueryOrderDto, @GetUser('id') userId: string) {
    return await this.ordersService.findAll(userId, query);
  }

  // ADMIN: Get order by ID
  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN]: Get order by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   */
  async findOneAdmin(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  //User: Get own order by id
  @Get(':id')
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get an order by ID for current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({ description: 'Order details', type: OrderApiResponseDto })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  /**
   * This method loads a single record by its identifier or another unique field.
   * It expects the identifying value and returns one matching result or throws an error when nothing is found.
   * It is important because detail pages and follow-up actions need a reliable way to fetch one record.
   */
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.ordersService.findOne(id, userId);
  }

  // ADMIN update order
  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: '[ADMIN] Update any order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({
    description: 'Order update successfully',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return await this.ordersService.update(id, dto);
  }

  // User: update own order
  @Patch(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Update your own order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({
    description: 'Order updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  /**
   * This method updates an existing record using the provided input.
   * It expects an identifier plus the fields to change, and it returns the updated result.
   * It is important because it keeps write logic in one place instead of spreading it across controllers.
   */
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.ordersService.update(id, dto, userId);
  }

  //Admin : Cancel an order
  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: 'ADMIN cancel order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order cancelled!',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  /**
   * This method cancels an existing record when the current rules allow it.
   * It expects the target identifier and may also use the current user to enforce ownership checks.
   * It is important because cancellation usually has side effects such as status changes or stock restoration.
   */
  async cancelAdmin(@Param('id') id: string) {
    return await this.ordersService.cancel(id);
  }

  // User cancel own order

  @Delete(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'User cancel order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order cancelled!',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  /**
   * This method cancels an existing record when the current rules allow it.
   * It expects the target identifier and may also use the current user to enforce ownership checks.
   * It is important because cancellation usually has side effects such as status changes or stock restoration.
   */
  async cancel(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.ordersService.cancel(id, userId);
  }
}
