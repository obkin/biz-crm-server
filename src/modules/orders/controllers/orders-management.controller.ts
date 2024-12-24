import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmptyObjectValidationPipe } from 'src/common/pipes/validate-empty-object.pipe';
import { idValidationPipe } from 'src/common/pipes/validate-id.pipe';
import { ChangeOrderStatusDto } from '../dto/change-order-status.dto';
import { Request } from 'express';
import { OrderStatus } from '../entities/order.entity';
import { OrdersManagementService } from '../services/orders-management.service';

@ApiTags('orders-management')
@Controller('/orders/management')
export class OrdersManagementController {
  constructor(
    private readonly ordersManagementService: OrdersManagementService,
  ) {}

  @ApiOperation({ summary: 'Accept order' })
  @ApiResponse({
    status: 200,
    description: 'Order accepted',
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
  @Patch('/confirm-order/:id')
  async confirmOrder(
    @Param('id', idValidationPipe) orderId: number,
    @Req() req: Request,
  ) {
    try {
      await this.ordersManagementService.confirmOrder(
        Number(req.user.id),
        Number(orderId),
      );
      return {
        user: req.user.id,
        orderId,
        message: 'Order status updated',
        newStatus: OrderStatus.CONFIRMED,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to accept order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Decline order' })
  @ApiResponse({
    status: 200,
    description: 'Order declined',
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
  @Patch('/decline-order/:id')
  async declineOrder(
    @Param('id', idValidationPipe) orderId: number,
    @Req() req: Request,
  ) {
    try {
      await this.ordersManagementService.declineOrder(
        Number(req.user.id),
        Number(orderId),
      );
      return {
        user: req.user.id,
        orderId,
        message: 'Order status updated',
        newStatus: OrderStatus.DECLINED,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to decline order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async cancelOrder() {}

  // --- Private ---

  @ApiOperation({ summary: 'Update order status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
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
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UsePipes(new EmptyObjectValidationPipe())
  @Patch('/change-order-status/:id')
  async changeOrderStatus(
    @Param('id', idValidationPipe) orderId: number,
    @Body() dto: ChangeOrderStatusDto,
    @Req() req: Request,
  ) {
    try {
      await this.ordersManagementService.changeOrderStatus(
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
