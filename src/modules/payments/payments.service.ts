/**
 * This service contains the business logic for the payments feature.
 * It usually talks to Prisma to load or change database records and returns data in the shape expected by the controller.
 * It is used by the payments controller and forms the main bridge between API requests and stored data.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// Import PrismaService from src/prisma/prisma.service so this file can use another shared part of the application.
import { PrismaService } from 'src/prisma/prisma.service';
// Import Stripe types and client helpers for the payment flow, even though the current implementation is commented out.
import Stripe from 'stripe';
// Import Stripe types and client helpers for the payment flow, even though the current implementation is commented out.
import type { Stripe as StripeType } from 'stripe';
// Import CreatePaymentIntentDto from ./dto/create-payment-intent.dto because this local file is part of the same feature or folder.
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { PaymentStatus, Prisma } from '@prisma/client';
// Import ConfirmPaymentDto from ./dto/confirm-payment.dto because this local file is part of the same feature or folder.
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
// Import PaymentResponseDto from ./dto/payment-response.dto because this local file is part of the same feature or folder.
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
/**
 * The PaymentsService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class PaymentsService {
  // private stripe: StripeType;

  // constructor(private prisma: PrismaService) {
  //   this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //     apiVersion: '2026-04-22.dahlia',
  //   });
  // }

  // // Create payment intent
  // async createPaymentIntent(
  //   userId: string,
  //   createPaymentIntentDto: CreatePaymentIntentDto,
  // ): Promise<{
  //   success: boolean;
  //   data: { clientSecret: string; paymentId: string };
  //   message: string;
  // }> {
  //   const { orderId, amount, currency = 'usd' } = createPaymentIntentDto;

  // Ask Prisma for the first order record that matches the filters. This is useful when the query is not based on one unique field.
  //   const order = await this.prisma.order.findFirst({
  //     where: { id: orderId, userId },
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${orderId} not found`);
  //   }

  // Ask Prisma for the first payment record that matches the filters. This is useful when the query is not based on one unique field.
  //   const existingPayment = await this.prisma.payment.findFirst({
  //     where: { orderId },
  //   });
  //   if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
  //     throw new BadRequestException('payment already completed for this order');
  //   }

  //   const paymentIntent = await this.stripe.paymentIntents.create({
  //     amount: Math.round(amount * 100),
  //     currency,
  //     metadata: { orderId, userId },
  //   });

  // Ask Prisma to create a new payment record in the database using the data provided below.
  //   const payment = await this.prisma.payment.create({
  //     data: {
  //       orderId,
  //       userid: userId,
  //       amount,
  //       currency,
  //       status: PaymentStatus.PENDING,
  //       paymentMethod: 'STRIPE',
  //       transactionId: paymentIntent.id,
  //     },
  //   });

  //   return {
  //     success: true,
  //     data: {
  //       clientSecret: paymentIntent.client_secret!,
  //       paymentId: payment.id,
  //     },
  //     message: 'Payment intent created successfully',
  //   };
  // }

  // // Confirm payment intent
  // async confirmPayment(
  //   userId: string,
  //   confirmPaymentDto: ConfirmPaymentDto,
  // ): Promise<{ success: boolean; data: PaymentResponseDto; message: string }> {
  //   const { paymentIntentId, orderId } = confirmPaymentDto;

  // Ask Prisma for the first payment record that matches the filters. This is useful when the query is not based on one unique field.
  //   const payment = await this.prisma.payment.findFirst({
  //     where: {
  //       orderId,
  //       userid: userId,
  //       transactionId: paymentIntentId,
  //     },
  //   });

  //   if (!payment) {
  //     throw new NotFoundException('payment not found');
  //   }

  //   if (payment.status === PaymentStatus.COMPLETED) {
  //     throw new BadRequestException('Payment already completed ');
  //   }

  //   const paymentIntent =
  //     await this.stripe.paymentIntents.retrieve(paymentIntentId);

  //   if (paymentIntent.status !== 'succeeded') {
  //     throw new BadRequestException('Payment not successful');
  //   }

  // Run these database steps inside a single transaction so all changes succeed together or fail together.
  //   const [updatedPayment] = await this.prisma.$transaction([
  // Ask Prisma to update an existing payment record that matches the given where condition.
  //     this.prisma.payment.update({
  //       where: { id: payment.id },
  //       data: { status: PaymentStatus.COMPLETED },
  //     }),

  // Ask Prisma to update an existing order record that matches the given where condition.
  //     this.prisma.order.update({
  //       where: { id: orderId },
  //       data: { status: 'PROCESSING' },
  //     }),
  //   ]);

  // Ask Prisma for the first order record that matches the filters. This is useful when the query is not based on one unique field.
  //   const order = await this.prisma.order.findFirst({
  //     where: {
  //       id: orderId,
  //     },
  //   });

  //   if (order?.cartId) {
  // Ask Prisma to update an existing cart record that matches the given where condition.
  //     await this.prisma.cart.update({
  //       where: { id: order.cartId },
  //       data: { checkedOut: true },
  //     });
  //   }

  //   return {
  //     success: true,
  //     data: this.mapToPaymentResponse({
  //       ...updatedPayment,
  //       userId: updatedPayment.userid,
  //     }),
  //     message: ' Payment confirmed successfully',
  //   };
  // }

  // // Get all payments for current user
  // async findAll(userId: string): Promise<{
  //   success: boolean;
  //   data: PaymentResponseDto[];
  //   message: string;
  // }> {
  // Ask Prisma for a list of payment records that match the given filters, pagination, and sorting rules.
  //   const payments = await this.prisma.payment.findMany({
  //     where: { userid: userId },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   return {
  //     success: true,
  //     data: payments.map((payment) => this.mapToPaymentResponse(payment)),
  //     message: 'Payments retrieved successfully',
  //   };
  // }

  // // Get payment by ID
  // async findOne(
  //   id: string,
  //   userId: string,
  // ): Promise<{
  //   success: boolean;
  //   data: PaymentResponseDto;
  //   message: string;
  // }> {
  // Ask Prisma for the first payment record that matches the filters. This is useful when the query is not based on one unique field.
  //   const payment = await this.prisma.payment.findFirst({
  //     where: { id, userid: userId },
  //   });

  //   if (!payment) {
  //     throw new NotFoundException(`Payment with ID ${id} not found`);
  //   }

  //   return {
  //     success: true,
  //     data: this.mapToPaymentResponse(payment),
  //     message: 'Payment retrieved successfully',
  //   };
  // }

  // // Get payment by Order ID
  // async findByOrder(
  //   orderId: string,
  //   userId: string,
  // ): Promise<{
  //   success: boolean;
  //   data: PaymentResponseDto | null;
  //   message: string;
  // }> {
  // Ask Prisma for the first payment record that matches the filters. This is useful when the query is not based on one unique field.
  //   const payment = await this.prisma.payment.findFirst({
  //     where: { orderId, userid: userId },
  //   });

  //   return {
  //     success: true,
  //     data: payment ? this.mapToPaymentResponse(payment) : null,
  //     message: 'Payment retrieved successfully',
  //   };
  // }

  // private mapToPaymentResponse(payment: any): PaymentResponseDto {
  //   return {
  //     id: payment.id,
  //     orderId: payment.orderId,
  //     userId: payment.userid,
  //     currency: payment.currency,
  //     amount: typeof payment.amount === 'object' && typeof payment.amount.toNumber === 'function' ? payment.amount.toNumber() : payment.amount,
  //     status: payment.status,
  //     paymentMethod: payment.paymentMethod,
  //     transactionId: payment.transactionId,
  //     createdAt: payment.createdAt,
  //     updatedAt: payment.updatedAt,
  //   };
  // }
}
