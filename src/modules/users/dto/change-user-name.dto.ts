import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeUserNameDto {
  @ApiProperty({
    example: 'Michael',
    description: 'The new username for the user',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  readonly newName: string;
}
