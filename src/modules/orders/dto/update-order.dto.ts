import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiProperty({
    example: 5,
    description: 'Quantity of the product to order',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  public quantity?: number;

  @ApiProperty({
    example: 100.5,
    description: 'Price of a single product unit',
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit price must be a valid number' },
  )
  @IsPositive({ message: 'Unit price must be a positive number' })
  public unitPrice?: number;

  @ApiProperty({
    example: OrderStatus.COMPLETED,
    description: 'The status of the order',
    required: false,
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: pending, completed, canceled',
  })
  public status?: OrderStatus;
}
