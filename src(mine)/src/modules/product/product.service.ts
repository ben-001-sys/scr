import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new ConflictException('A product  already exist with this sku');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
      },
    });

    return this.formatProduct(product);
  }

  private formatProduct(product: Product): ProductResponseDto {
    return {
      ...product,
    };
  }

  async findAll(): Promise<ProductResponseDto[]> {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        price: true,
        stock: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product Not found');
    }

    return this.formatProduct(product);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });
    return { message: 'Product Deleted Successfully' };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const skuTaken = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (skuTaken) {
        throw new ConflictException(
          `Product with ${updateProductDto.sku} already exists`,
        );
      }
    }

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.price !== undefined) {
      updateData.price = updateProductDto.price;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this.formatProduct(updatedProduct);
  }
}
