/**
 * This controller exposes the simplest top-level route in the project.
 * It forwards the request to AppService instead of putting response logic directly in the controller.
 * That small pattern mirrors how the larger feature controllers in the system are organized.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Controller, Get } from '@nestjs/common';
// Import AppService from ./app.service because this local file is part of the same feature or folder.
import { AppService } from './app.service';

@Controller()
/**
 * The AppController class handles HTTP requests for this feature.
 * Controllers translate web requests into service calls and return the result back to the client.
 * This controller is used by NestJS when a matching route is called.
 */
export class AppController {
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor(private readonly appService: AppService) {}

  @Get()
  /**
   * This method returns the simple welcome string for the root route.
   * It expects no input and returns a plain string response.
   * It is mainly useful as a simple example of the controller-to-service flow.
   */
  getHello(): string {
    return this.appService.getHello();
  }
}
