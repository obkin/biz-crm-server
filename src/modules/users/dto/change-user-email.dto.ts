import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeUserEmailDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'A new email for the user',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly newEmail: string;
}
