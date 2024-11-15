import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(userId: number, dto: CreateProductDto): Promise<ProductEntity> {
    try {
      const product = await this.productsRepository.create(userId, dto);
      this.logger.log(`New product created (id: ${product.id})`);
      return product;
    } catch (e) {
      throw e;
    }
  }

  async findAll(): Promise<ProductEntity[]> {
    try {
      return await this.productsRepository.findAll();
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<ProductEntity> {
    try {
      const product = await this.productsRepository.findOne(id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (e) {
      throw e;
    }
  }

  async update(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    try {
      await this.verifyOwnership(userId, productId);
      const updatedProduct = await this.productsRepository.update(
        productId,
        dto,
      );
      this.logger.log(
        `Product updated (userId: ${userId}, productId: ${productId})`,
      );
      return updatedProduct;
    } catch (e) {
      throw e;
    }
  }

  async remove(userId: number, productId: number): Promise<void> {
    try {
      await this.verifyOwnership(userId, productId);
      await this.productsRepository.remove(productId);
      this.logger.log(
        `Product removed (userId: ${userId}, productId: ${productId})`,
      );
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  private async verifyOwnership(
    userId: number,
    productId: number,
  ): Promise<void> {
    const product = await this.productsRepository.findOne(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to modify this product`,
      );
    }
  }
}
