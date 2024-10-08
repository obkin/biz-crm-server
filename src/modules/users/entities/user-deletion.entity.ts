import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users_deletion_history')
export class UserDeletionEntity {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier for each deletion record',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 123,
    description: 'ID of the deleted user',
  })
  @Column()
  public userId: number;

  @ApiProperty({
    example: 'john_doe@gmail.com',
    description: 'Email of the deleted user',
  })
  @Column()
  public userEmail: string;

  @ApiProperty({
    example: 'John',
    description: 'The name of the user',
  })
  @Column()
  public username: string;

  @ApiProperty({
    example: 'Violation of terms of service',
    description: 'Reason for deleting the user',
    maxLength: 200,
  })
  @Column({ length: 200 })
  public deletionReason: string;

  @ApiProperty({
    example: '2022-04-12T08:44:37.025Z',
    description: 'Date and time when the user was deleted',
  })
  @CreateDateColumn()
  public createdAt: Date;

  @ApiProperty({
    example: '2024-08-19T12:34:56.789Z',
    description: 'Date and time when the user was deleted',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public deletedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID of the admin who deleted the user',
  })
  @Column()
  public adminId: number;

  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email of the admin who deleted the user',
  })
  @Column()
  public adminEmail: string;
}
