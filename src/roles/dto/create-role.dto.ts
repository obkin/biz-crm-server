import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'User',
    description: 'Name of the role',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
