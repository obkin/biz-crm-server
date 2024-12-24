import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '../entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersManagementRepository } from '../repositories/orders-management.repository';
import { ProductsService } from 'src/modules/products/products.service';

@Injectable()
export class OrdersManagementService {
  private readonly logger = new Logger(OrdersManagementService.name);

  constructor(
    private readonly ordersManagementRepository: OrdersManagementRepository,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  async changeOrderStatus(
    userId: number,
    orderId: number,
    status: OrderStatus,
  ): Promise<void> {
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (order.status == status) {
        throw new BadRequestException('This status is already set');
      }
      order.status = status;
      await this.ordersManagementRepository.saveOrder(order);
    } catch (e) {
      throw e;
    }
  }

  async confirmOrder(userId: number, orderId: number): Promise<void> {
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `You can't accept this order anymore. This order is already ${order.status}`,
        );
      }
      await this.changeOrderStatus(userId, orderId, OrderStatus.CONFIRMED);
      await this.productsService.decreaseProductQuantity(
        userId,
        order.productId,
        order.quantity,
      );
    } catch (e) {
      throw e;
    }
  }

  async declineOrder(userId: number, orderId: number): Promise<void> {
    try {
      const order = await this.ordersService.findOneOrder(userId, orderId);
      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          `You can't decline this order anymore. This order is already ${order.status}`,
        );
      }
      await this.changeOrderStatus(userId, orderId, OrderStatus.DECLINED);
    } catch (e) {
      throw e;
    }
  }

  async cancelOrder() {}
  async checkOrderStatus() {}
}
