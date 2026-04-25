/**
 * This service is the single Prisma database client used by the application.
 * It opens and closes the database connection with the NestJS lifecycle and exposes Prisma model methods like user, product, and order queries.
 * Other services inject this class so they can read and write data without each module creating its own database connection.
 */
// Import NestJS decorators and helpers used to define this file's runtime behavior.
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// Import the PostgreSQL adapter that lets Prisma connect to a Postgres database.
import { PrismaPg } from '@prisma/adapter-pg';
// Import Prisma database types and enums so this file can work with strongly typed models and values.
import { PrismaClient } from '@prisma/client';

@Injectable()
/**
 * The PrismaService class contains the main business rules for this feature.
 * It exists so controllers can stay thin and focus on HTTP details while the service focuses on data and application logic.
 * Other parts of the system usually reach this class through dependency injection.
 */
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * NestJS calls the constructor to provide this class with the dependencies it needs.
   * The injected services are stored on the class so other methods can use them.
   * This is how classes in NestJS connect to shared providers like Prisma or configuration.
   */
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    /**
     * This method handles the super step of this file.
     * It expects the values listed in its parameters and returns the result type shown in its signature.
     * It is important because it plays one focused part in the request or data flow for this feature.
     */
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  /**
   * NestJS calls this lifecycle method when the module is ready.
   * It does not take request input and it returns a promise that completes after the database connection is opened.
   * This matters because Prisma must be connected before feature services start using it.
   */
  async onModuleInit() {
    await this.$connect();
    console.log('Database connected successfully!');
  }

  /**
   * NestJS calls this lifecycle method when the application is shutting down.
   * It returns a promise that completes after Prisma disconnects from the database.
   * This helps the app release resources cleanly.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected!');
  }

  /**
   * This helper removes data from Prisma models during non-production development or testing work.
   * It does not expect request data and returns the delete results for each model.
   * It exists to reset the database safely outside production.
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_'),
    );

    return Promise.all(
      models.map((modelKey) => {
        if (typeof modelKey === 'string') {
          return this[modelKey].deleteMany();
        }
      }),
    );
  }
}
