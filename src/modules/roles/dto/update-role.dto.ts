import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'Viewer',
    description: 'New name of the role',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
