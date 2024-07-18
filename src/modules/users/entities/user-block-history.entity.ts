import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users_block_history')
export class UserBlockHistoryEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => UserEntity, (user) => user.blockedEntries)
  public user: UserEntity;

  @ApiProperty({
    example: 456,
    description: 'The ID of the admin who blocked the user',
  })
  @Column()
  public adminId: number;

  @ApiProperty({
    example: 'Violation of terms of service',
    description: 'The reason for blocking the user',
  })
  @Column()
  public blockReason: string;

  @ApiProperty({
    example: 'temporary',
    description: 'The type of block (temporary or permanent)',
  })
  @Column({ type: 'varchar', length: 50 })
  public blockType: string; // do you need it? you can just block the user for 3000 days

  @ApiProperty({
    example: 'User was repeatedly posting spam content',
    description: 'Additional notes or comments regarding the block',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  public notes: string;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when the account was blocked',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public blockedAt: Date;

  @ApiProperty({
    example: '2024-04-20T08:44:37.025Z',
    description: 'The date and time when the account was unblocked',
    nullable: true,
  })
  @UpdateDateColumn({ nullable: true })
  public unblockedAt: Date;

  @ApiProperty({
    example: 7,
    description: 'The duration (in days) for which the user was blocked',
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  public blockDuration: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if the block is currently active',
  })
  @Column({ default: true })
  public isActive: boolean;
}
