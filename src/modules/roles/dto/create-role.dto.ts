import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'User',
    description: 'Name of the role',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'Name must be at least 3 characters long',
  })
  readonly name: string;
}
