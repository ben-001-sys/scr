/**
 * This DTO describes the data shape used by the category feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// DTO for updating an existing category

// Import Swagger decorators and builders so this API can describe itself in the generated docs.
import { PartialType } from '@nestjs/swagger';
// Import CreateCategoryDto from ./create-category.dto because this local file is part of the same feature or folder.
import { CreateCategoryDto } from './create-category.dto';

/**
 * The UpdateCategoryDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
