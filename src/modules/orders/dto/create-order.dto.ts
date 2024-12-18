import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsPositive, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class OrderCreateDto {
  @ApiProperty({
    example: 5,
    description: 'Quantity of the product to order',
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  public quantity: number;

  @ApiProperty({
    example: 100.5,
    description: 'Price of a single product unit',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit price must be a valid number' },
  )
  @IsPositive({ message: 'Unit price must be a positive number' })
  public unitPrice: number;

  @ApiProperty({
    example: 101.0,
    description: 'Total price of the order',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Total price must be a valid number' },
  )
  @IsPositive({ message: 'Total price must be a positive number' })
  public totalPrice: number;

  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the product being ordered',
  })
  @IsInt({ message: 'Product ID must be an integer' })
  @Min(1, { message: 'Product ID must be at least 1' })
  public productId: number;

  @ApiProperty({
    example: 321,
    description: 'The unique identifier of the user placing the order',
  })
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be at least 1' })
  public userId: number;

  @ApiProperty({
    example: OrderStatus.PENDING,
    description: 'The status of the order',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: pending, completed, canceled',
  })
  public status: OrderStatus = OrderStatus.PENDING;
}
