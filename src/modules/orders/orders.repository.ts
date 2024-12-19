import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { In, Not, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
  ) {}

  async createNewOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    try {
      const order = this.ordersRepository.create(dto);
      order.userId = userId;
      return await this.ordersRepository.save(order);
    } catch (e) {
      throw e;
    }
  }

  async findAllOrders() {}
  async findOneOrderById() {}
  async updateOrderById() {}
  async deleteOrderById() {}

  // --- Methods ---

  async findUnauthorizedOrders(
    userId: number,
    orderIds: number[],
  ): Promise<boolean> {
    try {
      const unauthorizedOrder = await this.ordersRepository.findOne({
        where: {
          id: In(orderIds),
          userId: Not(userId),
        },
      });

      return !!unauthorizedOrder;
    } catch (e) {
      throw e;
    }
  }
}
