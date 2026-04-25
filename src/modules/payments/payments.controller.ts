/**
 * This controller defines the HTTP endpoints for the payments feature.
 * It receives requests, reads route parameters or request bodies, and forwards the real work to the matching service.
 * It sits between incoming API calls and the payments service layer, often combining guards, decorators, and Swagger documentation.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// Import JwtAuthGuard from src/common/guards/jwt-auth.guard so this file can use another shared part of the application.
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// Import PaymentsService from ./payments.service because this local file is part of the same feature or folder.
import { PaymentsService } from './payments.service';
// Import CreatePaymentIntentDto from ./dto/create-payment-intent.dto because this local file is part of the same feature or folder.
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
// Import GetUser from src/common/decorators/get-user.decorator so this file can use another shared part of the application.
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {
  CreatePaymentIntentApiResponseDto,
  PaymentApiResponseDto,
} from './dto/payment-response.dto';
// Import ConfirmPaymentDto from ./dto/confirm-payment.dto because this local file is part of the same feature or folder.
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
/**
 * The PaymentsController class handles HTTP requests for this feature.
 * Controllers translate web requests into service calls and return the result back to the client.
 * This controller is used by NestJS when a matching route is called.
 */
export class PaymentsController {
  // constructor(private readonly paymentsService: PaymentsService) {}

  // @Post('create-intent')
  // @ApiOperation({
  //   summary: 'create payment intent',
  //   description: 'Create a payment intent for an order',
  // })
  // @ApiCreatedResponse({
  //   description: 'Payment intent created successfully',
  //   type: CreatePaymentIntentApiResponseDto,
  // })
  // @ApiBadRequestResponse({
  //   description: 'invalid data or order not found',
  // })
  // async createPaymentIntent(
  //   @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  //   @GetUser('id') userId: string,
  // ) {
  //   return await this.paymentsService.createPaymentIntent(
  //     userId,
  //     createPaymentIntentDto,
  //   );
  // }

  // @Post('confirm')
  // @ApiOperation({
  //   summary: 'Confirm payment',
  //   description: 'Confirm a payment intent for an order',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Payment confirmed successfully',
  //   type: PaymentApiResponseDto,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Payment not found or already completed',
  // })
  // async confirmPayment(
  //   @Body() confirmPaymentDto: ConfirmPaymentDto,
  //   @GetUser('id') userId: string,
  // ) {
  //   return await this.paymentsService.confirmPayment(userId, confirmPaymentDto);
  // }

  // @Get()
  // @ApiOperation({
  //   summary: 'Get all payments',
  //   description: 'Get all payments for the current user',
  // })
  // @ApiOkResponse({
  //   description: 'Payments retrieved successfully',
  //   type: PaymentApiResponseDto,
  // })
  // async findAll(@GetUser('id') userId: string) {
  //   return await this.paymentsService.findAll(userId);
  // }

  // @Get(':id')
  // @ApiParam({
  //   name: 'id',
  //   description: 'Payment ID',
  //   example: '154sd4848ds5d-4654-4sdd8s7d-sd4656',
  // })
  // @ApiOperation({
  //   summary: 'Get payment by ID',
  //   description: 'Get a specific payment by its ID',
  // })
  // @ApiOkResponse({
  //   description: 'Payment retrieved successfully',
  //   type: PaymentApiResponseDto,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Payment not found',
  // })
  // async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
  //   return await this.paymentsService.findOne(id, userId);
  // }

  // // Get payment by order ID
  // @Get('order/:orderId')
  // @ApiParam({
  //   name: 'orderId',
  //   description: 'Order ID',
  //   example: 'order-123',
  // })
  // @ApiOperation({
  //   summary: 'Get payment by order ID',
  //   description: 'Get payment information for a specific order',
  // })
  // @ApiOkResponse({
  //   description: 'Payment retrieved successfully',
  //   type: PaymentApiResponseDto,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Payment not found',
  // })
  // async findByOrder(
  //   @Param('orderId') orderId: string,
  //   @GetUser('id') userId: string,
  // ) {
  //   return await this.paymentsService.findByOrder(orderId, userId);
  // }
}
