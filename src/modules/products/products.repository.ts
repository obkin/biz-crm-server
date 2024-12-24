import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository, In, Not, EntityManager } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async createNewProduct(
    userId: number,
    dto: CreateProductDto,
  ): Promise<ProductEntity> {
    try {
      const product = this.productsRepository.create(dto);
      product.userId = userId;
      return await this.productsRepository.save(product);
    } catch (e) {
      throw e;
    }
  }

  async findAllProducts(userId?: number): Promise<ProductEntity[]> {
    try {
      if (userId) {
        return await this.productsRepository.find({ where: { userId } });
      } else {
        return await this.productsRepository.find();
      }
    } catch (e) {
      throw e;
    }
  }

  async findOneProductById(
    productId: number,
    manager?: EntityManager,
  ): Promise<ProductEntity> {
    const repository = manager
      ? manager.getRepository(ProductEntity)
      : this.productsRepository;
    try {
      return await repository.findOne({
        where: { id: productId },
      });
    } catch (e) {
      throw e;
    }
  }

  async updateProductById(
    productId: number,
    dto: UpdateProductDto,
    manager?: EntityManager,
  ): Promise<ProductEntity> {
    const repository = manager
      ? manager.getRepository(ProductEntity)
      : this.productsRepository;
    try {
      const updatedProduct = await repository.save({
        ...dto,
        id: productId,
      });
      return updatedProduct;
    } catch (e) {
      throw e;
    }
  }

  async deleteProductById(productId: number): Promise<void> {
    try {
      const result = await this.productsRepository.delete({ id: productId });
      if (result.affected === 0) {
        throw new NotFoundException(`Product not found`);
      }
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  async findUnauthorizedProducts(
    userId: number,
    productIds: number[],
  ): Promise<boolean> {
    try {
      const unauthorizedProduct = await this.productsRepository.findOne({
        where: {
          id: In(productIds),
          userId: Not(userId),
        },
      });

      return !!unauthorizedProduct;
    } catch (e) {
      throw e;
    }
  }
}
