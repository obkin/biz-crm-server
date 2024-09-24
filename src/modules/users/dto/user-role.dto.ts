import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRoleDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  readonly userId: number;

  @ApiProperty({
    description: 'The ID of the role',
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  readonly roleId: number;
}
