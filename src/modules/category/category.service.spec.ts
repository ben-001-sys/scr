/**
 * This file contains automated tests for one part of the application.
 * The test creates a small NestJS testing module so the target class can be exercised in isolation.
 * It helps confirm that the related controller or service is wired correctly.
 */
// Import NestJS testing helpers used to build a lightweight test module for this spec file.
import { Test, TestingModule } from '@nestjs/testing';
// Import CategoryService from ./category.service because this local file is part of the same feature or folder.
import { CategoryService } from './category.service';

/**
 * This method handles the describe step of this file.
 * It expects the values listed in its parameters and returns the result type shown in its signature.
 * It is important because it plays one focused part in the request or data flow for this feature.
 */
describe('CategoryService', () => {
  let service: CategoryService;

  /**
   * This method handles the before Each step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  /**
   * This method handles the it step of this file.
   * It expects the values listed in its parameters and returns the result type shown in its signature.
   * It is important because it plays one focused part in the request or data flow for this feature.
   */
  it('should be defined', () => {
    /**
     * This method handles the expect step of this file.
     * It expects the values listed in its parameters and returns the result type shown in its signature.
     * It is important because it plays one focused part in the request or data flow for this feature.
     */
    expect(service).toBeDefined();
  });
});
