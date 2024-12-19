import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateOrderDto {
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
    example: 123,
    description: 'The unique identifier of the product being ordered',
  })
  @IsInt({ message: 'Product ID must be an integer' })
  @Min(1, { message: 'Product ID must be at least 1' })
  public productId: number;
}
