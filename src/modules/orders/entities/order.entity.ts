import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrderStatus } from '../common/enums';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @ApiProperty({
    example: 2,
    description: 'The quantity of the product ordered',
  })
  @Column('int')
  public quantity: number;

  @ApiProperty({
    example: 99.99,
    description: 'The unit price of the product at the time of the order',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  public unitPrice: number;

  @ApiProperty({
    example: 199.98,
    description: 'The total price for the order (quantity * unitPrice)',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  public totalPrice: number;

  @ApiProperty({
    example: OrderStatus.PENDING,
    description: 'The status of the order',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  public status: OrderStatus;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @ApiProperty({
    example: 321,
    description: 'The unique identifier of the user who made the order',
  })
  @Index()
  @Column()
  public userId: number;

  @ManyToOne(() => ProductEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  public product: ProductEntity;

  @ApiProperty({
    example: 123,
    description: 'The unique identifier of product',
  })
  @Index()
  @Column()
  public productId: number;
}
