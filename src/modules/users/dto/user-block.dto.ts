import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Max,
} from 'class-validator';

export class UserBlockDto {
  @ApiProperty({
    example: 99,
    description: 'The ID of the user to be blocked',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({
    example: 'Violation of terms of service',
    description: 'The reason for blocking the user',
  })
  @IsString()
  @IsNotEmpty()
  readonly blockReason: string;

  @ApiProperty({
    example: 'User was repeatedly posting spam content',
    description: 'Additional notes or comments regarding the block',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly notes: string;

  @ApiProperty({
    example: 7,
    description: 'The duration (in days) for which the user is blocked',
  })
  @IsNumber()
  @IsNotEmpty()
  @Max(3650)
  readonly blockDuration: number;
}
