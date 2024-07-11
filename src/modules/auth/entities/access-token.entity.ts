import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('access_tokens')
export class AccessTokenEntity {
  @ApiProperty({
    example: 129,
    description: 'The unique identifier of the access token',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The unique access token string',
  })
  @Index({ unique: true })
  @Column()
  public accessToken: string;

  @ApiProperty({
    example: 123,
    description: 'User ID associated with the access token',
  })
  @Column()
  public userId: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the access token',
  })
  @Column({ type: 'timestamp' })
  public expiresIn: Date;

  @ApiProperty({
    example: '2024-07-02T15:30:00Z',
    description: 'The date and time when the access token was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;
}
