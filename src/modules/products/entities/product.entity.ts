import { FolderEntity } from 'src/modules/folders/entities/folder.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  RelationId,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_NAME_LENGTH } from '../products.constants';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the product',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'Baseus Desktop Lamp',
    description: 'The name of the product',
    maxLength: MAX_NAME_LENGTH,
  })
  @Column({ length: MAX_NAME_LENGTH })
  public name: string;

  @ApiProperty({
    example: 'Baseus Desktop Lamp - is a lamp that will turn your life around',
    description: 'The description of the product',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  public description: string;

  @ApiProperty({
    example: 749.25,
    description: 'The price of the product',
  })
  @Column('decimal', { precision: 10, scale: 2, unsigned: true })
  public price: number;

  @ApiProperty({
    example: 10,
    description: 'The quantity of the products',
  })
  @Column('int', { unsigned: true })
  public quantity: number;

  @ApiProperty({
    example: 'https://aws-s3/image?fh43FAgJ343gfhGHJ11344',
    description: 'Image address of the product',
    nullable: true,
  })
  @Column({ nullable: true })
  public imageUrl: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'folderId' })
  public folder: FolderEntity;

  @ManyToOne(() => UserEntity, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @ApiProperty({
    example: 321,
    description: 'The unique identifier of the user who owns this folder',
  })
  @Index()
  @RelationId((product: ProductEntity) => product.user)
  public userId: number;
}
