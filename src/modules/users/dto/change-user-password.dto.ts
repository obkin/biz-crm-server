import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeUserPasswordDto {
  @ApiProperty({
    example: 'oldPassword123!',
    description: 'The old password of the user',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly oldPassword: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: 'A new password for the user',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly newPassword: string;
}
