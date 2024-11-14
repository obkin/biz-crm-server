import { FolderEntity } from 'src/modules/folders/entities/folder.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
    maxLength: 70,
  })
  @Column({ length: 70 })
  public name: string;

  @ApiProperty({
    example: 'John Dope',
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
    example: 42,
    description: 'The unique identifier of the user who owns this product',
  })
  @Column()
  public userId: number;
}
