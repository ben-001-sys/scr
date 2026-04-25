/**
 * This service contains the small sample business logic used by AppController.
 * It shows the basic NestJS service pattern where a controller delegates work to an injectable class.
 * In the larger modules, services play the same role for auth, users, products, carts, orders, and payments.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Injectable } from '@nestjs/common';

@Injectable()
/**
 * The AppService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class AppService {
  /**
   * This method returns the simple welcome string for the root route.
   * It expects no input and returns a plain string response.
   * It is mainly useful as a simple example of the controller-to-service flow.
   */
  getHello(): string {
    return 'Happy new year';
  }
}
