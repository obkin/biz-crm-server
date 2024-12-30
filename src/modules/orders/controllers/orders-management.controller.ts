import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { OrdersManagementService } from '../services/orders-management.service';
import { OrderStatus } from '../common/enums';

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
  @ApiQuery({ name: 'id', required: true, description: 'ID of the order' })
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
  @ApiQuery({ name: 'id', required: true, description: 'ID of the order' })
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

  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({
    status: 200,
    description: 'Order canceled',
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
  @Patch('/cancel-order/:id')
  async cancelOrder(
    @Param('id', idValidationPipe) orderId: number,
    @Req() req: Request,
  ) {
    try {
      await this.ordersManagementService.cancelOrder(
        Number(req.user.id),
        Number(orderId),
      );
      return {
        user: req.user.id,
        orderId,
        message: 'Order status updated',
        newStatus: OrderStatus.CANCELED,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to cancel order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Complete order' })
  @ApiResponse({
    status: 200,
    description: 'Order completed',
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
  @Patch('/complete-order/:id')
  async completeOrder(
    @Param('id', idValidationPipe) orderId: number,
    @Req() req: Request,
  ) {
    try {
      await this.ordersManagementService.completeOrder(
        Number(req.user.id),
        Number(orderId),
      );
      return {
        user: req.user.id,
        orderId,
        message: 'Order status updated',
        newStatus: OrderStatus.COMPLETED,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to complete order. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

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
  @ApiQuery({ name: 'id', required: true, description: 'ID of the order' })
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
