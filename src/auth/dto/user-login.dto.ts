import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ example: 'john_dope@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;

  @ApiProperty({ example: '192.168.0.1', required: false })
  @IsOptional()
  @IsString()
  readonly ipAddress?: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly userAgent?: string;
}
