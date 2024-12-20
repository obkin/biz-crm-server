import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { idValidationPipe } from 'src/common/pipes/validate-id.pipe';
import { EmptyObjectValidationPipe } from 'src/common/pipes/validate-empty-object.pipe';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

@ApiTags('orders')
@Controller('/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({
    status: 201,
    description: 'New order created',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<OrderEntity> {
    try {
      return await this.ordersService.createOrder(Number(req.user.id), dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to create new order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all orders',
    type: [OrderEntity],
  })
  @ApiResponse({
    status: 403,
    description: 'No access',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get()
  async findAll(@Req() req: Request, @Query('userId') ownerId?: number) {
    try {
      const orders = await this.ordersService.findAllOrders(
        Number(req.user.id),
        Number(ownerId),
      );
      return { amount: orders.length, orders };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find all orders. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved order by id',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 403,
    description: 'No access',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the order' })
  @Get(':id')
  async findOne(
    @Param('id', idValidationPipe) orderId: number,
    @Req() req: Request,
  ): Promise<OrderEntity> {
    try {
      return await this.ordersService.findOneOrder(
        Number(req.user.id),
        Number(orderId),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find the order by ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Update order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 403,
    description: 'No access',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the order' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UsePipes(new EmptyObjectValidationPipe())
  @Patch(':id')
  async update(
    @Param('id', idValidationPipe) orderId: number,
    @Body() dto: UpdateOrderDto,
    @Req() req: Request,
  ): Promise<OrderEntity> {
    try {
      return await this.ordersService.updateOrder(
        Number(req.user.id),
        Number(orderId),
        dto,
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to update the order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({
    status: 200,
    description: 'Order deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 403,
    description: 'No access',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the order' })
  @HttpCode(200)
  @Delete(':id')
  async remove(
    @Param('id', idValidationPipe) orderId: number,
    @Req() req: Request,
  ) {
    try {
      await this.ordersService.removeOrder(
        Number(req.user.id),
        Number(orderId),
      );
      return { orderId, message: 'Order removed' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete the order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- Management ---

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UsePipes(new EmptyObjectValidationPipe())
  @Patch('/change-order-status/:id')
  async changeOrderStatus(
    @Param('id', idValidationPipe) orderId: number,
    @Body() dto: ChangeOrderStatusDto,
    @Req() req: Request,
  ) {
    try {
      await this.ordersService.changeOrderStatus(
        Number(req.user.id),
        Number(orderId),
        dto.status,
      );
      return {
        orderId,
        message: 'Order status updated',
        newStatus: dto.status,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to update order status. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
