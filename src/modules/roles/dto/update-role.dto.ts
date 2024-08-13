import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'Viewer',
    description: 'New name of the role',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'Role name must be at least 3 characters long',
  })
  @MaxLength(12, {
    message: 'Role name must not exceed 12 characters',
  })
  readonly name: string;
}
