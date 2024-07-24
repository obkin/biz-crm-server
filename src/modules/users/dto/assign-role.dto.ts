import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'The ID of the user to whom the role will be assigned',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    description: 'The ID of the role to be assigned to the user',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly roleId: number;
}
