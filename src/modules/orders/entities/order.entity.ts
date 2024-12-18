import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column('int')
  public quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  public unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  public totalPrice: number;

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
