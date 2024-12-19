import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { UsersService } from '../users/services/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { ProductsService } from '../products/products.service';

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
      const product = await this.productsService.checkProductExisting(
        dto.productId,
      );
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      const productQuantity = await this.productsService.getProductQuantity(
        dto.productId,
      );
      if (productQuantity < dto.quantity) {
        throw new BadRequestException(
          'There is no such quantity of the product',
        );
      }

      const orderDto = {
        ...dto,
        status: OrderStatus.PENDING,
        totalPrice: Number(dto.quantity) * Number(dto.unitPrice),
      };
      const order = await this.ordersRepository.createNewOrder(
        userId,
        orderDto,
      );
      this.logger.log(`New order created (id: ${order.id})`);
      return order;
    } catch (e) {
      throw e;
    }
  }

  async findAllOrders() {}
  async findOneOrder() {}
  async updateOrder() {}
  async removeOrder() {}

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
