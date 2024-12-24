import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { UsersService } from '../users/services/users.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly usersService: UsersService,
  ) {}

  async createProduct(
    userId: number,
    dto: CreateProductDto,
  ): Promise<ProductEntity> {
    try {
      const product = await this.productsRepository.createNewProduct(
        userId,
        dto,
      );
      this.logger.log(`New product created (id: ${product.id})`);
      return product;
    } catch (e) {
      throw e;
    }
  }

  async findAllProducts(
    userId: number,
    ownerId?: number,
  ): Promise<ProductEntity[]> {
    try {
      if (!ownerId) {
        const isAdmin = await this.usersService.checkIsUserAdmin(userId);
        if (!isAdmin) {
          throw new ForbiddenException(
            `You do not have permission to get or modify this product(s)`,
          );
        }
      }

      const products = await this.productsRepository.findAllProducts(ownerId);

      if (ownerId) {
        const productIds = products.map((product) => product.id);
        await this.verifyAccess(userId, productIds);
      }

      return products;
    } catch (e) {
      throw e;
    }
  }

  async findOneProduct(
    userId: number,
    productId: number,
    manager?: EntityManager,
  ): Promise<ProductEntity> {
    try {
      const product = await this.productsRepository.findOneProductById(
        productId,
        manager,
      );
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      await this.verifyAccess(userId, [productId]);
      return product;
    } catch (e) {
      throw e;
    }
  }

  async updateProduct(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    try {
      await this.findOneProduct(userId, productId);
      const updatedProduct = await this.productsRepository.updateProductById(
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

  async removeProduct(userId: number, productId: number): Promise<void> {
    try {
      await this.verifyAccess(userId, [productId]);
      await this.productsRepository.deleteProductById(productId);
      this.logger.log(
        `Product removed (userId: ${userId}, productId: ${productId})`,
      );
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  private async verifyAccess(
    userId: number,
    productIds: number[],
  ): Promise<void> {
    const isAdmin = await this.usersService.checkIsUserAdmin(userId);
    if (isAdmin) {
      return;
    }

    const hasUnauthorized =
      await this.productsRepository.findUnauthorizedProducts(
        userId,
        productIds,
      );

    if (hasUnauthorized) {
      throw new ForbiddenException(
        `You do not have permission to get or modify this product(s)`,
      );
    }
  }

  async checkProductExisting(productId: number): Promise<boolean> {
    try {
      const product =
        await this.productsRepository.findOneProductById(productId);
      return !!product;
    } catch (e) {
      throw e;
    }
  }

  async getProductQuantity(productId: number) {
    try {
      const product =
        await this.productsRepository.findOneProductById(productId);
      return product.quantity;
    } catch (e) {
      throw e;
    }
  }

  async decreaseProductQuantity(
    userId: number,
    productId: number,
    decreaseBy: number,
    manager: EntityManager,
  ): Promise<void> {
    try {
      const product = await this.findOneProduct(userId, productId, manager);
      if (product.quantity < decreaseBy) {
        throw new BadRequestException(
          `There is no such quantity of this product. Alaivable: ${product.quantity}`,
        );
      }
      const updatedProduct = {
        ...product,
        quantity: product.quantity - decreaseBy,
      };
      await this.productsRepository.updateProductById(
        productId,
        updatedProduct,
        manager,
      );
    } catch (e) {
      throw e;
    }
  }
}
