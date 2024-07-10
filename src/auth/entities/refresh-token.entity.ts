import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @ApiProperty({
    example: 4321,
    description: 'The unique identifier of the refresh token',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The unique refresh token string',
  })
  @Index({ unique: true })
  @Column()
  refreshToken: string;

  @ApiProperty({
    example: 123,
    description: 'User ID associated with the refresh token',
  })
  @Column()
  userId: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the refresh token',
  })
  @Column({ type: 'timestamp' })
  expiresIn: Date;

  @ApiProperty({
    example: '192.168.0.1',
    description: 'IP address from which the token was generated',
    required: false,
  })
  @Column({ nullable: true })
  ipAddress: string; // need to add

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    description: 'User agent string of the client',
    required: false,
  })
  @Column({ nullable: true })
  userAgent: string; // need to add
}
