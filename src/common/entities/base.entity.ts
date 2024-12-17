import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the entity',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time of creating',
  })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time of updating',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;
}
