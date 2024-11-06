import { FolderEntity } from 'src/modules/folders/entities/folder.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'folderId' })
  folder: FolderEntity;
}
