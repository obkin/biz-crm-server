import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users_unblock_history')
export class UserUnblockEntity {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier for each unblock record',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the user who was unblocked',
  })
  @Column()
  public userId: number;

  @ApiProperty({
    example: 'john_dope@gmail.com',
    description: 'The email of the user who was unblocked',
  })
  @Column()
  public userEmail: string;

  @ApiProperty({
    example: 'The user has appealed successfully',
    description: 'The reason for unblocking the user',
    nullable: true,
    maxLength: 200,
  })
  @Column({ length: 200 })
  public unblockReason?: string;

  @ApiProperty({
    example: 'Additional notes or comments regarding the unblock process',
    description: 'Additional notes or comments regarding the block',
    nullable: true,
    maxLength: 300,
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  public notes?: string;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when the account was blocked',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public unblockedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID of the admin who unblocked the user',
  })
  @Column()
  public adminId: number;

  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email of the admin who unblocked the user',
  })
  @Column()
  public adminEmail: string;
}
