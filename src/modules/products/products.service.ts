import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    try {
      const product = await this.productsRepository.create(dto);
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

  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    try {
      const existingProduct = await this.productsRepository.findOne(id);
      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }
      const updatedProduct = await this.productsRepository.update(id, dto);
      this.logger.log(`Product updated (id: ${id})`);
      return updatedProduct;
    } catch (e) {
      throw e;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.productsRepository.remove(id);
      this.logger.log(`Product removed (id: ${id})`);
    } catch (e) {
      throw e;
    }
  }
}