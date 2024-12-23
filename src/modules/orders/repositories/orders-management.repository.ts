import { Injectable } from '@nestjs/common';
import { OrderEntity } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersManagementRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersManagementRepository: Repository<OrderEntity>,
  ) {}

  async saveOrder(order: OrderEntity): Promise<void> {
    try {
      await this.ordersManagementRepository.save(order);
    } catch (e) {
      throw e;
    }
  }
}
