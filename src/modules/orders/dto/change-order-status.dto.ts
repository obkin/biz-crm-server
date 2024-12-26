import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../common/enums';

export class ChangeOrderStatusDto {
  @ApiProperty({
    example: OrderStatus.COMPLETED,
    description: 'New status of the order',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus, {
    message:
      'Status must be one of: pending, accepted, declined, completed, canceled',
  })
  public status: OrderStatus;
}
