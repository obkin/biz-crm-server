import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'john_dope@gmail.com',
    description: 'The unique email of the user',
  })
  @Column({ unique: true })
  public email: string;

  @ApiProperty({
    example: '$2b$10$fWHZ.JcwITaj9M.bJJLaDuPK399J3LnEirrJMSuLRt9F8LeyltXRu',
    description: 'The secret password of the user',
  })
  @Column()
  public password: string;

  @ApiProperty({
    example: 'John',
    description: 'The name of the user',
  })
  @Column()
  public username: string;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when account was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'The date and time when account was updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;
}
