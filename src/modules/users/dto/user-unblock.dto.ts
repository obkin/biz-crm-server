import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserUnblockDto {
  @ApiProperty({
    example: 99,
    description: 'The unique identifier of the user to be unblocked',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({
    example: 'The user has appealed successfully.',
    description: 'The reason for unblocking the user',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly unblockReason?: string;

  @ApiProperty({
    example: 'Additional notes or comments regarding the unblock process',
    description: 'Additional notes or comments',
    maxLength: 300,
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
