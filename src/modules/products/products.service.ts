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
import { ProductAction } from './common/enums';

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

  public async checkProductExisting(productId: number): Promise<boolean> {
    try {
      const product =
        await this.productsRepository.findOneProductById(productId);
      return !!product;
    } catch (e) {
      throw e;
    }
  }

  public async getProductQuantity(productId: number) {
    try {
      const product =
        await this.productsRepository.findOneProductById(productId);
      return product.quantity;
    } catch (e) {
      throw e;
    }
  }

  public async getProductInfo(productId: number): Promise<ProductEntity> {
    try {
      const product =
        await this.productsRepository.findOneProductById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (e) {
      throw e;
    }
  }

  public async changeProductQuantity(
    userId: number,
    productId: number,
    changeBy: number,
    action: ProductAction,
    manager: EntityManager,
  ): Promise<void> {
    try {
      const product = await this.findOneProduct(userId, productId, manager);

      if (action === ProductAction.DECREASE) {
        if (product.quantity < changeBy) {
          throw new BadRequestException(
            `There is no such quantity of this product. Alaivable: ${product.quantity}`,
          );
        }

        product.quantity -= changeBy;
      } else if (action === ProductAction.INCREASE) {
        product.quantity += changeBy;
      } else {
        throw new BadRequestException('Invalid action');
      }

      await this.productsRepository.updateProductById(
        productId,
        product,
        manager,
      );
    } catch (e) {
      throw e;
    }
  }
}
