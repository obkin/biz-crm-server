import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @ApiProperty({
    example: 129,
    description: 'The unique identifier of the refresh token',
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The unique refresh token string',
  })
  @Index({ unique: true })
  @Column()
  public refreshToken: string;

  @ApiProperty({
    example: 123,
    description: 'User ID associated with the refresh token',
  })
  @Column()
  public userId: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the refresh token',
  })
  @Column({ type: 'timestamp' })
  public expiresIn: Date;

  @ApiProperty({
    example: '192.168.0.1',
    description: 'IP address from which the token was generated',
    required: false,
  })
  @Column({ nullable: true })
  public ipAddress?: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    description: 'User agent string of the client',
    required: false,
  })
  @Column({ nullable: true })
  public userAgent?: string;

  @ApiProperty({
    example: '2024-07-02T15:30:00Z',
    description: 'The date and time when the refresh token was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;
}
