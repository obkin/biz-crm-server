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
export class UserBlockEntity {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier for each block record',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => UserEntity, (user) => user.blockEntries, { eager: true })
  public user: UserEntity;

  @ApiProperty({
    example: 'Violation of terms of service',
    description: 'The reason for blocking the user',
    maxLength: 200,
  })
  @Column({ length: 200 })
  public blockReason: string;

  @ApiProperty({
    example: 'User was repeatedly posting spam content',
    description: 'Additional notes or comments regarding the block',
    nullable: true,
    maxLength: 300,
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  public notes: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the block is currently active',
  })
  @Column({ default: true })
  public isActive: boolean;

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
    example: 1,
    description: 'The duration (in minutes) for which the user was blocked',
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  public blockDuration: number;

  @ApiProperty({
    example: '2024-04-20T08:44:37.025Z',
    description: 'The date and time when the account was unblocked',
    nullable: true,
  })
  @UpdateDateColumn({ nullable: true })
  public unblockAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID of the admin who blocked the user',
  })
  @Column()
  public adminId: number;

  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email of the admin who blocked the user',
  })
  @Column()
  public adminEmail: string;
}
