import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @ApiProperty({ example: 123 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '$2b$10$fWHZ.JcwITaj9M.bJJLaDuPK399J3LnEirrJMSuLRt9F8LeyltXRu',
  })
  @Column()
  password: string;

  @ApiProperty({ example: 'John' })
  @Column()
  username: string;

  @ApiProperty({ example: 'user, helper' })
  @Column({ default: 'user' })
  roles: string;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'Account created date',
  })
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'Account updated date',
  })
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
