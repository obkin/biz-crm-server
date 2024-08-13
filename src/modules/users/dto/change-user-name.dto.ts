import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangeUserNameDto {
  @ApiProperty({
    example: 'Michael',
    description: 'The new username for the user',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'New user name must be at least 3 characters long',
  })
  @MaxLength(20, {
    message: 'New user name must not exceed 20 characters',
  })
  readonly newName: string;
}
