import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token string',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    example: 123,
    description: 'User ID associated with the refresh token',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the refresh token',
  })
  @IsNotEmpty()
  @IsDateString()
  expiresIn: Date;

  @ApiProperty({
    example: '192.168.0.1',
    description: 'IP address from which the token was generated',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    description: 'User agent string of the client',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent: string;
}
