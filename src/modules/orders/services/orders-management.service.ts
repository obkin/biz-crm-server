import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersManagementRepository } from '../repositories/orders-management.repository';
import { ProductsService } from 'src/modules/products/products.service';
import { DataSource, EntityManager } from 'typeorm';
import { OrderStatus } from '../common/enums';
import { ProductAction } from 'src/modules/products/common/enums';

@Injectable()
export class OrdersManagementService {
  private readonly logger = new Logger(OrdersManagementService.name);

  constructor(
    private readonly ordersManagementRepository: OrdersManagementRepository,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async confirmOrder(userId: number, orderId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `You can't accept this order anymore. This order is already ${order.status}`,
        );
      }
      await this.productsService.changeProductQuantity(
        userId,
        order.productId,
        order.quantity,
        ProductAction.DECREASE,
        queryRunner.manager,
      );
      await this.changeOrderStatus(
        userId,
        orderId,
        OrderStatus.CONFIRMED,
        queryRunner.manager,
      );
      this.logger.log(`Order confirmed (orderId: ${orderId})`);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async declineOrder(userId: number, orderId: number): Promise<void> {
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (
        order.status !== OrderStatus.PENDING &&
        order.status == OrderStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          `You can't decline this order anymore. This order is already ${order.status}`,
        );
      }
      await this.changeOrderStatus(userId, orderId, OrderStatus.DECLINED);
      this.logger.log(`Order declined (orderId: ${orderId})`);
    } catch (e) {
      throw e;
    }
  }

  async cancelOrder(userId: number, orderId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(
          `You can't cancel this order. This order is ${order.status}`,
        );
      }
      await this.productsService.changeProductQuantity(
        userId,
        order.productId,
        order.quantity,
        ProductAction.INCREASE,
        queryRunner.manager,
      );
      await this.changeOrderStatus(
        userId,
        orderId,
        OrderStatus.CANCELED,
        queryRunner.manager,
      );
      this.logger.log(`Order canceled (orderId: ${orderId})`);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async completeOrder(userId: number, orderId: number): Promise<void> {
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(
          `You can't complete this order. This order is ${order.status}`,
        );
      }
      await this.changeOrderStatus(userId, orderId, OrderStatus.COMPLETED);
      this.logger.log(`Order completed (orderId: ${orderId})`);
    } catch (e) {
      throw e;
    }
  }

  async checkOrderStatus() {}

  // --- Methods ---

  async changeOrderStatus(
    userId: number,
    orderId: number,
    status: OrderStatus,
    manager?: EntityManager,
  ): Promise<void> {
    try {
      const order = await this.ordersService.findOneOrder(
        userId,
        orderId,
        manager,
      );
      if (order.status == status) {
        throw new BadRequestException('This status is already set');
      }
      order.status = status;
      await this.ordersManagementRepository.saveOrder(order, manager);
    } catch (e) {
      throw e;
    }
  }
}
