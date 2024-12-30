import { IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllOrdersQueryDto {
  @ApiProperty({
    description: 'Owner ID of the order',
    required: false,
    type: Number,
  })
  @IsOptional()
  public ownerId?: number;

  @ApiProperty({
    description: 'Status of the order',
    required: false,
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  public status?: OrderStatus;

  @ApiProperty({
    description: 'Whether the order is archived',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  public isArchived?: boolean;
}
