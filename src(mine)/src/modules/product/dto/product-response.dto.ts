export class ProductResponseDto {
  id: string;

  name: string;

  description: string | null;

  sku: string;

  price: number;

  stock: number;

  imageUrl: string | null;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}
