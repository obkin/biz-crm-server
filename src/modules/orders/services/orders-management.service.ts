import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '../entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersManagementRepository } from '../repositories/orders-management.repository';

@Injectable()
export class OrdersManagementService {
  private readonly logger = new Logger(OrdersManagementService.name);

  constructor(
    private readonly ordersManagementRepository: OrdersManagementRepository,
    private readonly ordersService: OrdersService,
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

  async acceptOrder() {}
  async declineOrder() {}
  async cancelOrder() {}
  async checkOrderStatus() {}
}
