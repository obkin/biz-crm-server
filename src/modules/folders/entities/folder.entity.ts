import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { MAX_FOLDER_NAME_LENGTH } from '../folder.constants';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('folders')
export class FolderEntity {
  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the folder',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'Photos',
    description: 'The name of the folder',
    maxLength: MAX_FOLDER_NAME_LENGTH,
  })
  @Column({ length: MAX_FOLDER_NAME_LENGTH })
  public name: string;

  @ManyToOne(() => UserEntity, (user) => user.folders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @OneToMany(() => ProductEntity, (product) => product.folder)
  public products: ProductEntity[];

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when folder was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when folder was updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;
}
