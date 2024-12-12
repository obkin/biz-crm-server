import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { UserBlockEntity } from './user-block.entity';
import { UserUnblockEntity } from './user-unblock.entity';
import { FolderEntity } from 'src/modules/folders/entities/folder.entity';
import { OrderEntity } from 'src/modules/orders/entities/order.entity';
import { ProductEntity } from 'src/modules/products/entities/product.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'john_dope@gmail.com',
    description: 'The unique email of the user',
  })
  @Column({ unique: true, length: 255 })
  public email: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the user email is confirmed',
  })
  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @ApiProperty({
    example: '$2b$10$fWHZ.JcwITaj9M.bJJLaDuPK399J3LnEirrJMSuLRt9F8LeyltXRu',
    description: 'The secret hashed password of the user',
  })
  @Column()
  public password: string;

  @ApiProperty({
    example: 'John Dope',
    description: 'The name of the user',
  })
  @Column({ unique: true, length: 255 })
  public username: string;

  @ApiProperty({
    example: '["user", "admin"]',
    description: 'Roles assigned to the user',
  })
  @Column('text', { array: true, default: ['user'] })
  public roles: string[];

  @ApiProperty({
    example: false,
    description: 'Indicates if the user is blocked',
  })
  @Column({ default: false })
  public isBlocked: boolean;

  @OneToMany(() => UserBlockEntity, (blockHistory) => blockHistory.userId)
  public blockEntries: UserBlockEntity[];

  @OneToMany(() => UserUnblockEntity, (unblockHistory) => unblockHistory.userId)
  public unblockEntries: UserUnblockEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.user)
  public folders: FolderEntity[];

  @OneToMany(() => ProductEntity, (product) => product.user)
  public products: ProductEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  public orders: OrderEntity[];
}
