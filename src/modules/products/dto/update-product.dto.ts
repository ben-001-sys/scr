/**
 * This DTO describes the data shape used by the products feature.
 * DTO stands for Data Transfer Object, which means this class explains what data a request or response should contain.
 * Validation and Swagger decorators here help controllers accept clean input and document the API clearly.
 */
// DTO for updating an existing product

// Import Swagger decorators and builders so this API can describe itself in the generated docs.
import { PartialType } from '@nestjs/swagger';
// Import CreateProductDto from ./create-product.dto because this local file is part of the same feature or folder.
import { CreateProductDto } from './create-product.dto';

/**
 * The UpdateProductDto class describes a specific API data shape.
 * It exists so NestJS validation and Swagger documentation can understand the expected fields.
 * Controllers and services rely on this class to keep request and response structures consistent.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
