import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpDFJD3...',
  })
  refreshToken: string;

  @ApiProperty({ example: '192.168.0.1' })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })
  userAgent: string;
}
