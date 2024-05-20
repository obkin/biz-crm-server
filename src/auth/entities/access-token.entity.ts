import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class AccessTokenEntity {
  @ApiProperty({
    example: 4321,
    description: 'The unique identifier of the access token',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The unique access token string',
  })
  @Index({ unique: true })
  @Column()
  accessToken: string;

  @ApiProperty({
    example: 123,
    description: 'User ID associated with the access token',
  })
  @Column()
  userId: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the access token',
  })
  @Column({ type: 'timestamp' })
  expiresIn: Date;
}
