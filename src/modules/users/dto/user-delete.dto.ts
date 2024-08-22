import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class UserDeleteDto {
  @ApiProperty({
    example: 99,
    description: 'ID of the user to be deleted',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({
    example: 'Violation of terms of service',
    description: 'Reason for deleting the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  readonly deletionReason: string;
}
