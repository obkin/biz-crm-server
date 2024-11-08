import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    try {
      const product = this.productsRepository.create(dto);
      return await this.productsRepository.save(product);
    } catch (e) {
      throw e;
    }
  }

  async findAll(): Promise<ProductEntity[]> {
    try {
      return await this.productsRepository.find();
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<ProductEntity> {
    try {
      return await this.productsRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    try {
      await this.productsRepository.update(id, dto);
      return this.findOne(id);
    } catch (e) {
      throw e;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.productsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product not found`);
      }
    } catch (e) {
      throw e;
    }
  }
}
