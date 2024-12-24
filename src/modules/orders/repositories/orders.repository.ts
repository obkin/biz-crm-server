import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../entities/order.entity';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

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

  async findAllOrders(userId?: number): Promise<OrderEntity[]> {
    try {
      if (userId) {
        return await this.ordersRepository.find({ where: { userId } });
      } else {
        return await this.ordersRepository.find();
      }
    } catch (e) {
      throw e;
    }
  }

  async findOneOrderById(
    orderId: number,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    const repository = manager
      ? manager.getRepository(OrderEntity)
      : this.ordersRepository;
    try {
      return await repository.findOne({
        where: { id: orderId },
      });
    } catch (e) {
      throw e;
    }
  }

  async updateOrderById(
    orderId: number,
    dto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    try {
      const updatedOrder = await this.ordersRepository.save({
        ...dto,
        id: orderId,
      });
      return updatedOrder;
    } catch (e) {
      throw e;
    }
  }

  async deleteOrderById(orderId: number): Promise<void> {
    try {
      const result = await this.ordersRepository.delete({ id: orderId });
      if (result.affected === 0) {
        throw new NotFoundException(`Order not found`);
      }
    } catch (e) {
      throw e;
    }
  }

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
