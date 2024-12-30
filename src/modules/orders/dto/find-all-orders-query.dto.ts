import { IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../common/enums';

export class FindAllOrdersQueryDto {
  @IsOptional()
  ownerId?: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
