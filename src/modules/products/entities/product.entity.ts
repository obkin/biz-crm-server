import { FolderEntity } from 'src/modules/folders/entities/folder.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_NAME_LENGTH } from '../common/products.constants';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('products')
export class ProductEntity extends BaseEntity {
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

  @ManyToOne(() => UserEntity, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @ApiProperty({
    example: 321,
    description: 'The unique identifier of the user who owns the folder',
  })
  @Index()
  @Column()
  public userId: number;

  @ManyToOne(() => FolderEntity, (folder) => folder.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'folderId' })
  public folder: FolderEntity;
}
