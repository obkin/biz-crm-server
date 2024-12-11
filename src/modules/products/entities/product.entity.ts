import { FolderEntity } from 'src/modules/folders/entities/folder.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_NAME_LENGTH } from '../products.constants';

@Entity('products')
export class ProductEntity {
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
  @Column('decimal', { precision: 10, scale: 2 })
  public price: number;

  @ApiProperty({
    example: 10,
    description: 'The quantity of the products',
  })
  @Column('int')
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

  @ApiProperty({
    example: 321,
    description: 'The unique identifier of the user who owns this product',
  })
  @Index()
  @Column()
  public userId: number;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when product was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when product was updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;
}
