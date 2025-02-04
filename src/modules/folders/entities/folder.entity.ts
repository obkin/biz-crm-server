import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from 'src/modules/products/entities/product.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { MAX_FOLDER_NAME_LENGTH } from '../common/folders.constants';
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('folders')
export class FolderEntity extends BaseEntity {
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

  @ApiProperty({
    example: 321,
    description: 'The unique identifier of the user who owns the folder',
  })
  @Index()
  @Column()
  public userId: number;

  @OneToMany(() => ProductEntity, (product) => product.folder)
  public products: ProductEntity[];
}
