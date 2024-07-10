import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @ApiProperty({
    example: 99,
    description: 'The unique identifier of the role',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'User',
    description: 'Name of the role',
  })
  @Index({ unique: true })
  @Column({ length: 20 })
  public name: string;

  @ApiProperty({
    example: '2024-07-02T15:30:00Z',
    description: 'The date and time when the role was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @ApiProperty({
    example: '2024-07-02T15:30:00Z',
    description: 'The date and time when the role was last updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;
}
