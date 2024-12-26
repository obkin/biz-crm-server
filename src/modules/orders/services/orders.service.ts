import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { UsersService } from '../../users/services/users.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { ProductsService } from '../../products/products.service';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { EntityManager } from 'typeorm';
import { OrderStatus } from '../common/enums';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto): Promise<OrderEntity> {
    try {
      const product = await this.productsService.getProductInfo(dto.productId);
      if (product.quantity < dto.quantity) {
        throw new BadRequestException(
          'There is no such quantity of the product',
        );
      }

      const orderCreateDto = {
        ...dto,
        unitPrice: Number(product.price),
        status: OrderStatus.PENDING,
        totalPrice: Number(
          (Number(dto.quantity) * Number(product.price)).toFixed(2),
        ),
      };
      const order = await this.ordersRepository.createNewOrder(
        userId,
        orderCreateDto,
      );
      this.logger.log(`New order created (id: ${order.id})`);
      return order;
    } catch (e) {
      throw e;
    }
  }

  async findAllOrders(
    userId: number,
    ownerId?: number,
  ): Promise<OrderEntity[]> {
    try {
      if (!ownerId) {
        const isAdmin = await this.usersService.checkIsUserAdmin(userId);
        if (!isAdmin) {
          throw new ForbiddenException(
            `You do not have permission to get or modify this order(s)`,
          );
        }
      }

      const orders = await this.ordersRepository.findAllOrders(ownerId);

      if (ownerId) {
        const orderIds = orders.map((order) => order.id);
        await this.verifyAccess(userId, orderIds);
      }

      return orders;
    } catch (e) {
      throw e;
    }
  }

  async findOneOrder(
    userId: number,
    orderId: number,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    try {
      const order = await this.ordersRepository.findOneOrderById(
        orderId,
        manager,
      );
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      await this.verifyAccess(userId, [orderId]);
      return order;
    } catch (e) {
      throw e;
    }
  }

  async updateOrder(
    userId: number,
    orderId: number,
    dto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    try {
      const updateOrderDto = {
        ...dto,
        totalPrice: Number(dto.quantity) * Number(dto.unitPrice),
      };
      await this.findOneOrder(userId, orderId);
      const updatedOrder = await this.ordersRepository.updateOrderById(
        orderId,
        updateOrderDto,
      );
      this.logger.log(`Order updated (userId: ${userId}, orderId: ${orderId})`);
      return updatedOrder;
    } catch (e) {
      throw e;
    }
  }

  async removeOrder(userId: number, orderId: number): Promise<void> {
    try {
      await this.verifyAccess(userId, [orderId]);
      await this.ordersRepository.deleteOrderById(orderId);
      this.logger.log(`Order removed (userId: ${userId}, orderId: ${orderId})`);
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  private async verifyAccess(
    userId: number,
    orderIds: number[],
  ): Promise<void> {
    const isAdmin = await this.usersService.checkIsUserAdmin(userId);
    if (isAdmin) {
      return;
    }

    const hasUnauthorized = await this.ordersRepository.findUnauthorizedOrders(
      userId,
      orderIds,
    );

    if (hasUnauthorized) {
      throw new ForbiddenException(
        `You do not have permission to get or modify this order(s)`,
      );
    }
  }
}
