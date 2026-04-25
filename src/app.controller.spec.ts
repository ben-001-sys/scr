/**
 * This file contains automated tests for one part of the application.
 * The test creates a small NestJS testing module so the target class can be exercised in isolation.
 * It helps confirm that the related controller or service is wired correctly.
 */
// Import NestJS testing helpers used to build a lightweight test module for this spec file.
import { Test, TestingModule } from '@nestjs/testing';
// Import AppController from ./app.controller because this local file is part of the same feature or folder.
import { AppController } from './app.controller';
// Import AppService from ./app.service because this local file is part of the same feature or folder.
import { AppService } from './app.service';

/**
 * This method handles the describe step of this file.
 * It expects the values listed in its parameters and returns the result type shown in its signature.
 * It is important because it plays one focused part in the request or data flow for this feature.
 */
describe('AppController', () => {
  let appController: AppController;

  /**
   * This method handles the before Each step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * This method handles the describe step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  describe('root', () => {
    /**
     * This method handles the it step of this file.
     * It expects the values listed in its parameters and returns the result type shown in its signature.
     * It is important because it plays one focused part in the request or data flow for this feature.
     */
    it('should return "Hello World!"', () => {
      /**
       * This method handles the expect step of this file.
       * It expects the values listed in its parameters and returns the result type shown in its signature.
       * It is important because it plays one focused part in the request or data flow for this feature.
       */
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
