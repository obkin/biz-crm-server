import { Injectable } from '@nestjs/common';
import { OrderEntity } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrdersManagementRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersManagementRepository: Repository<OrderEntity>,
  ) {}

  async saveOrder(order: OrderEntity, manager?: EntityManager): Promise<void> {
    const repository = manager
      ? manager.getRepository(OrderEntity)
      : this.ordersManagementRepository;
    try {
      await repository.save(order);
    } catch (e) {
      throw e;
    }
  }
}
