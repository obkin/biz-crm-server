import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveRoleDto {
  @ApiProperty({
    description: 'The ID of the user from whom the role will be removed',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    description: 'The ID of the role to be removed from the user',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly roleId: number;
}
