import { Injectable, Logger } from '@nestjs/common';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  // CRUD
  async create() {}
  async findAll() {}
  async findOne() {}
  async update() {}
  async remove() {}
}
